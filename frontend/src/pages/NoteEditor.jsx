import {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {useParams, useNavigate, Link} from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {ArrowLeft} from 'lucide-react';
import api from '../api/client.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {getCanvasClass} from '../theme/sessionTheme.js';
import {validateProps} from '../utils/validateProps.js';

//module level, not inside the component. a fresh object on every render makes
//quill tear down and rebuild its toolbar as you type
const quillModules = {
    toolbar: [
        [{header: [1, 2, 3, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        [{list: 'ordered'}, {list: 'bullet'}],
        ['blockquote', 'code'],
        ['link'],
        ['clean'],
    ],
}

//a whitelist. quills default toolbar offers colours, fonts and sizes that the
//backend sanitizer throws away, so without this you can style text, hit save,
//and watch the formatting vanish on reload
const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'blockquote', 'code', 'link',
]

//wrapper only exists to give the editor a key, so switching note ids remounts it with fresh state
function NoteEditor(props){
    //react 19 no longer runs propTypes itself, so the checks are invoked by hand
    validateProps(NoteEditor.propTypes, props, 'NoteEditor')

    const{id} = useParams()
    return <NoteEditorForm key={id || 'new'} id={id} refreshNotes={props.refreshNotes}/>
}

//shared shell so the loading, not found and error states sit on the same background
function EditorShell(props){

    validateProps(EditorShell.propTypes, props, 'EditorShell')

    const {children} = props

    return (
        <div className={`min-h-screen ${getCanvasClass('dashboard')}`}>
            <div className='mx-auto max-w-3xl px-5 sm:px-10 py-8'>
                {children}
            </div>
        </div>
    )
}

function NoteEditorForm(props){

    validateProps(NoteEditorForm.propTypes, props, 'NoteEditorForm')

    const { id, refreshNotes } = props

    const navigate = useNavigate()

    const isEditRoute = Boolean(id)

    const[title, setTitle] = useState('')
    const[content, setContent] = useState('')
    const[loading, setLoading] = useState(isEditRoute)
    const[notFound, setNotFound] = useState(false)
    const[loadError, setLoadError] = useState('')
    const[saveError, setSaveError] = useState('')
    const[saving, setSaving] = useState(false)

    //what the note looked like when it loaded, so we can tell whether anything was typed
    const[savedTitle, setSavedTitle] = useState('')
    const[savedContent, setSavedContent] = useState('')
    const[confirmLeave, setConfirmLeave] = useState(false)

    const formRef = useRef(null)

    const isDirty = title !== savedTitle || content !== savedContent

    //covers closing the tab or hitting refresh. react router navigation does not
    //fire this, which is why the leave confirm below exists as well
    useEffect(() => {
        if (!isDirty) return

        function warn(e) {
            e.preventDefault()
            //chrome ignores preventDefault alone and needs returnValue set
            e.returnValue = ''
        }

        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [isDirty])

    //ctrl+s on windows, cmd+s on mac. has to be on document because focus is
    //usually inside quills editable div, which is not part of the form
    useEffect(() => {
        function handleKey(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                //without this the browser opens its own save page dialog
                e.preventDefault()
                //requestSubmit fires the submit event, form.submit() would skip it
                formRef.current?.requestSubmit()
            }
        }

        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [])

    //if editing an existing note, fetch it by id instead of searching a prop list
    useEffect(() => {
        if (!isEditRoute) return;

        //the key prop in App.jsx remounts this component per id, so state starts clean already
        let cancelled = false;

        api.get(`/notes/${id}`)
            .then((res) => {
                if (cancelled) return;
                setTitle(res.data.note.title);
                setContent(res.data.note.content);
                //the baseline the dirty check compares against
                setSavedTitle(res.data.note.title);
                setSavedContent(res.data.note.content);
            })
            .catch((err) => {
                if (cancelled) return;
                //only a real 404 means not found, anything else is a connection problem
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setLoadError('Could not load this note, try again');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        //if the id changes before this finishes, ignore the old response
        return () => { cancelled = true; };
    }, [id, isEditRoute]);

    async function handleSave(e)
    {
        e.preventDefault()

        //the disabled button blocks a second click, but ctrl+s bypasses the button entirely
        if (saving) return;

        setSaveError('')
        setSaving(true)

        try {
            if(isEditRoute)
            {
                await api.put(`/notes/${id}`, {title, content});
            }
            else
            {
                await api.post('/notes', {title, content});
            }

            refreshNotes();
            navigate('/dashboard')
        } catch (err) {
            //stay on the page so the user doesnt lose what they typed
            setSaveError(err.response?.data?.message || 'Could not save, try again');
        } finally {
            setSaving(false)
        }
    }

    //only nags when there is actually something to lose
    function attemptLeave()
    {
        if (isDirty) {
            setConfirmLeave(true)
        } else {
            navigate('/dashboard')
        }
    }

    if (loading) {
        return (
            <EditorShell>
                <p className='text-sm text-ink/50'>Loading...</p>
            </EditorShell>
        )
    }

    if (notFound) {
        return (
            <EditorShell>
                <div className='rounded-3xl bg-surface p-9 text-center'>
                    <h1 className='text-xl font-bold text-ink'>Note not found</h1>
                    <p className='mt-1 mb-6 text-sm text-ink/50'>It may have been deleted.</p>
                    <Link to='/dashboard' className='inline-block rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90'>
                        Back to notes
                    </Link>
                </div>
            </EditorShell>
        )
    }

    if (loadError) {
        return (
            <EditorShell>
                <div className='rounded-3xl bg-surface p-9 text-center'>
                    <h1 className='text-xl font-bold text-ink'>Something went wrong</h1>
                    <p className='mt-1 mb-6 text-sm text-ink/50'>{loadError}</p>
                    <Link to='/dashboard' className='inline-block rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90'>
                        Back to notes
                    </Link>
                </div>
            </EditorShell>
        )
    }

    return(
        <EditorShell>

            {/* a button rather than a Link, so unsaved work gets a warning
                instead of vanishing the moment you click away */}
            <button
                type='button'
                onClick={attemptLeave}
                className='mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition hover:text-ink'
            >
                <ArrowLeft size={16}/>
                Back to notes
            </button>

            <h1 className='mb-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-ink'>
                {isEditRoute ? 'Edit note' : 'New note'}
            </h1>

            <form ref={formRef} onSubmit={handleSave} className='rounded-3xl bg-surface p-6 sm:p-8'>

                {saveError && (
                    <p role='alert' className='mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>{saveError}</p>
                )}

                <div className='mb-6'>
                    <label htmlFor='title' className='mb-1 block text-sm font-medium text-ink/50'>Title</label>
                    <input
                        id='title'
                        type='text'
                        value={title}
                        onChange={(e)=> setTitle(e.target.value)}
                        placeholder='Untitled note'
                        className='w-full bg-transparent text-2xl font-bold tracking-tight text-ink placeholder:text-ink/25 focus:outline-none'
                    />
                </div>

                <div className='mb-7'>
                    {/* a span rather than a label, quills editable div is not a labelable
                        element so htmlFor would point at nothing */}
                    <span className='mb-1 block text-sm font-medium text-ink/50'>Content</span>
                    <ReactQuill
                        theme='snow'
                        value={content}
                        onChange={setContent}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder='Start writing...'
                    />
                </div>

                <div className='flex gap-2'>
                    <button
                        type='submit'
                        disabled={saving}
                        className='flex-1 rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:active:scale-100 sm:flex-none sm:px-8'
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        type='button'
                        onClick={attemptLeave}
                        className='flex-1 rounded-xl bg-gray-100 py-3.5 text-sm font-semibold text-ink transition hover:bg-gray-200 sm:flex-none sm:px-8'
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <ConfirmDialog
                open={confirmLeave}
                title='Discard changes?'
                message='You have unsaved changes. Leaving now will lose them.'
                confirmLabel='Discard'
                onConfirm={()=> navigate('/dashboard')}
                onCancel={()=> setConfirmLeave(false)}
            />
        </EditorShell>
    )
}

const refreshNotesShape = {
  refreshNotes: PropTypes.func.isRequired,
}

NoteEditor.propTypes = refreshNotesShape
NoteEditorForm.propTypes = {
  ...refreshNotesShape,
  //absent on the /editor route, present as a url param on /editor/:id
  id: PropTypes.string,
}
EditorShell.propTypes = {
  children: PropTypes.node.isRequired,
}

export default NoteEditor;

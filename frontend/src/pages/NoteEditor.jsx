import {useState, useEffect, useRef} from 'react';
import PropTypes from "prop-types";
import {useParams, useNavigate, Link} from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {ArrowLeft} from 'lucide-react';
import api from '../api/client.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { getCanvasClass } from '../theme/sessionTheme.js';
import { validateProps } from "../utils/validateProps";

//module level, a new object every render makes quill rebuild its toolbar as you type
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

//whitelist, the backend sanitizer strips colours and fonts so dont offer them
const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'blockquote', 'code', 'link',
]

//wrapper only exists to give the editor a key, so switching note ids remounts it with fresh state
function NoteEditor(props)
{
    validateProps(NoteEditor.propTypes, props, 'NoteEditor');

    const{id} = useParams()
    return <NoteEditorForm key={id || 'new'} id={id} refreshNotes={props.refreshNotes}/>
}

//shared shell so loading, not found and error all sit on the same background
function EditorShell(props)
{
    validateProps(EditorShell.propTypes, props, 'EditorShell');

    const {children} = props

    return (
        <div className={`min-h-screen ${getCanvasClass('dashboard')}`}>
            <div className='mx-auto max-w-3xl px-5 sm:px-10 py-8'>
                {children}
            </div>
        </div>
    )
}

function NoteEditorForm(props)
{
    validateProps(NoteEditorForm.propTypes, props, 'NoteEditorForm');

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

    const[savedTitle, setSavedTitle] = useState('')
    const[savedContent, setSavedContent] = useState('')
    const[confirmLeave, setConfirmLeave] = useState(false)

    const formRef = useRef(null)

    const isDirty = title !== savedTitle || content !== savedContent

    //covers closing the tab or refreshing, router navigation does not fire this
    useEffect(() => {
        if (!isDirty) return

        function warn(e) {
            e.preventDefault()
            e.returnValue = ''
        }

        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [isDirty])

    //on document because focus is usually inside quills editable div, not the form
    useEffect(() => {
        function handleKey(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
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

        //the disabled button blocks a second click but ctrl+s goes around it
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

            {/* a button not a Link, so unsaved work gets a warning first */}
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
                    {/* a span not a label, quills editable div cant be labelled */}
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
  id: PropTypes.string,
}

EditorShell.propTypes = {
  children: PropTypes.any.isRequired,
}

export default NoteEditor;

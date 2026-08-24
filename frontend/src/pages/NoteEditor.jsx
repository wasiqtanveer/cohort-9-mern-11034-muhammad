import {useState, useEffect} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../api/client.js';

//wrapper only exists to give the editor a key, so switching note ids remounts it with fresh state
function NoteEditor({ refreshNotes }){
    const{id} = useParams()
    return <NoteEditorForm key={id || 'new'} id={id} refreshNotes={refreshNotes}/>
}

function NoteEditorForm({ id, refreshNotes }){

    const navigate = useNavigate()

    const isEditRoute = Boolean(id)

    const[title, setTitle] = useState('')
    const[content, setContent] = useState('')
    const[loading, setLoading] = useState(isEditRoute)
    const[notFound, setNotFound] = useState(false)
    const[loadError, setLoadError] = useState('')
    const[saveError, setSaveError] = useState('')
    const[saving, setSaving] = useState(false)

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

    if (loading) {
        return <p>Loading...</p>
    }

    if (notFound) {
        return <p>Note not found</p>
    }

    if (loadError) {
        return <p>{loadError}</p>
    }

    return(
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">


               
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        {isEditRoute ? 'Edit Note' : 'New Note'}
                    </h1>

                    {saveError && (
                      <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4'>{saveError}</p>
                    )}

                    <form onSubmit={handleSave}>
                        <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                        id='title'
                        type='text'
                        value={title}
                        onChange={(e)=> setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>


                        <div className="mb-4">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <ReactQuill
                        theme='snow'
                        value={content}
                        onChange={setContent}/>
                        </div>


                        <div className="flex gap-3">
                        <button type='submit' disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button type='button' onClick={()=>navigate('/dashboard')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default NoteEditor;

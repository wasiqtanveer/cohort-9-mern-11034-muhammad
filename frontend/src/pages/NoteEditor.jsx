import {useState} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function NoteEditor({ notes,setNotes }){

    const{id} = useParams()
    const navigate = useNavigate()

    const isEditRoute = Boolean(id)
    const existingNote = notes.find((note) =>note.id === Number(id))

    const[title, setTitle] = useState(existingNote? existingNote.title:'')
    const[content, setContent] = useState(existingNote? existingNote.content:'')


    function handleSave(e)
    {
        e.preventDefault()

        if(existingNote)
        {
            setNotes(notes.map((note)=>
            note.id ===existingNote.id?{...note, title, content}:note
            ))
        }
        else
        {
            const newNote = {id:Date.now(),title,content}
            setNotes([...notes,newNote])
        }
        navigate('/dashboard')
    }

    if (isEditRoute && !existingNote) {
  return <p>Note not found</p>
}

    return(
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">


               
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        {existingNote ? 'Edit Note' : 'New Note'}
                    </h1>

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
                        <button type='submit' className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                            Save
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
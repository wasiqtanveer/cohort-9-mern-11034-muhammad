import {useState} from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function NoteEditor({ notes,setNotes }){

    const{id} = useParams()
    const navigate = useNavigate()

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

    return(
        <div>
            <h1>
                {existingNote ? 'Edit Note' : 'New Note'}
            </h1>

            <form onSubmit={handleSave}>
                <label htmlFor="title">Title</label>
                <input
                id='title'
                type='text'
                value={title}
                onChange={(e)=> setTitle(e.target.value)}
                />

                <label htmlFor="content">Content</label>
                <ReactQuill
                theme='snow'
                value={content}
                onChange={setContent}/>

                <button type='submit'> Save </button>
                <button type='button' onClick={()=>navigate('/dashboard')}>Cancel</button>
            </form>
        </div>
    )
}

export default NoteEditor;
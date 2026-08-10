import {Link,} from 'react-router-dom';
import DOMPurify from 'dompurify';


function Dashboard({notes, setNotes}){ //recieving as props for app.jsx 

  return (
  <div>
    <h1>Dashboard</h1>
    <Link to='/editor'>+ New Note</Link>

    <ul>
      {notes.map((note)=>(
        <li key={note.id}>
          
          <h3>{note.title}</h3>
          <div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(note.content)}} />

          <button onClick={()=> setNotes(notes.filter((n)=> n.id!== note.id))} >Delete</button>

          <Link to={`/editor/${note.id}`}>Edit</Link>
        </li>
      ))}
    </ul>

    <Link to='/login'>go to login </Link>
  </div>
  )
}

export default Dashboard;

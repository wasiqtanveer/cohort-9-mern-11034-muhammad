import {Link, Navigate} from 'react-router-dom';
import { useState} from 'react'

const dummyNotes = [
  {id:1, title:'Grocey List', content:'milk, eggs, bread'},
  {id:2, title:'Meeting Notes', content:'Discuss App Scalibility'},
  {id:3, title:'Ideas', content:'Build a Notes aop'}
]

function Dashboard(){
  const[notes, setNotes] = useState(dummyNotes)

  return (
  <div>
    <h1>Dashboard</h1>

    <ul>
      {notes.map((note)=>(
        <li key={note.id}>
          
          <h3>{note.title}</h3>
          <p>{note.content}</p>

        </li>
      ))}
    </ul>

    <Link to='/login'>go to login </Link>
  </div>
  )
}

export default Dashboard;

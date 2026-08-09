import {Link,} from 'react-router-dom';
import { useState} from 'react'

const dummyNotes = [
  {id:1, title:'Grocery List', content:'milk, eggs, bread'},
  {id:2, title:'Meeting Notes', content:'Discuss App Scalability'},
  {id:3, title:'Ideas', content:'Build a Notes app'}
]

function Dashboard(){
  //will add setNotes later when we implement add note functionality
  const[notes] = useState(dummyNotes)

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

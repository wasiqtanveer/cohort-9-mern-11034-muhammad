import {Routes, Route, Navigate} from 'react-router-dom';
import {useState} from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';


const dummyNotes = [
  {id:1, title:'Grocery List', content:'milk, eggs, bread'},
  {id:2, title:'Meeting Notes', content:'Discuss App Scalability'},
  {id:3, title:'Ideas', content:'Build a Notes app'}
]

function App()
{

  const[notes,setNotes] = useState(dummyNotes)

  return(
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/signup' element={<Signup />}/>
      <Route path='/dashboard' element={<Dashboard notes={notes} setNotes={setNotes}/>}/>
      <Route path='/editor/:id' element={<NoteEditor notes={notes} setNotes={setNotes}/>}/>
      <Route path='/editor' element={<NoteEditor notes={notes} setNotes={setNotes}/>}/>
    </Routes>
  )
}

export default App;
import {Routes, Route, Navigate} from 'react-router-dom';
import Trash from './pages/Trash';
import {useState, useEffect, useCallback} from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import {useAuth} from './context/Auth-context.js';
import api from './api/client.js';

function App()
{
  const [notes, setNotes] = useState([])
  const [notesError, setNotesError] = useState('')
  const [notesLoading, setNotesLoading] = useState(true)
  const {user} = useAuth()

  
  const refreshNotes = useCallback(() => {
    if (!user) return;
    api.get("/notes")
      .then((res) => {
        setNotes(res.data.notes);
        setNotesError('');
      })
       .catch(() => {
        setNotes([]);
        setNotesError('Could not load your notes. Check your connection and try again.');
      })
      .finally(() => {
        setNotesLoading(false);
      });
  }, [user]);

  //fetch the list whenever we go from logged out to logged in
  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  return(
    <Routes>
      <Route path='/' element={<Navigate to='/login' replace />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/signup' element={<Signup />}/>
      <Route path='/trash' element={<ProtectedRoute>
        <Trash refreshNotes={refreshNotes}/>
      </ProtectedRoute>}/>

      <Route path='/dashboard' element={<ProtectedRoute>
        <Dashboard notes={notes} refreshNotes={refreshNotes} notesError={notesError} notesLoading={notesLoading}/>
      </ProtectedRoute>}/>

      <Route path='/editor/:id' element={<ProtectedRoute>
        <NoteEditor refreshNotes={refreshNotes}/>
      </ProtectedRoute>}/>

      <Route path='/editor' element={<ProtectedRoute>
        <NoteEditor refreshNotes={refreshNotes}/>
      </ProtectedRoute>}/>

      <Route path='/profile' element={<ProtectedRoute>
        <Profile/>
      </ProtectedRoute>}>

      </Route>
    </Routes>
  )
}

export default App;

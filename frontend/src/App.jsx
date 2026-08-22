import {Routes, Route, Navigate} from 'react-router-dom';
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
  const {user} = useAuth()

  //useCallback so this function has a stable identity, safe to put in a dependency array
  const refreshNotes = useCallback(() => {
    if (!user) return;
    api.get("/notes")
      .then((res) => {
        setNotes(res.data.notes);
        setNotesError('');
      })
      .catch(() => {
        //without this a failed fetch just looks like you have no notes
        setNotes([]);
        setNotesError('Could not load your notes. Check your connection and try again.');
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

      <Route path='/dashboard' element={<ProtectedRoute>
        <Dashboard notes={notes} refreshNotes={refreshNotes} notesError={notesError}/>
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

import {Link,} from 'react-router-dom';
import DOMPurify from 'dompurify';
import {useAuth} from '../context/Auth-context.js';
import {Pencil, Trash2} from 'lucide-react';
import api from '../api/client.js';

//different colors for the note cards
const cardColors = [
  'bg-rose-50 border-rose-200',
  'bg-amber-50 border-amber-200',
  'bg-emerald-50 border-emerald-200',
  'bg-sky-50 border-sky-200',
  'bg-violet-50 border-violet-200',
  'bg-pink-50 border-pink-200',
]

function getCardColor(id)
{
  return cardColors[id%cardColors.length]
}


function Dashboard({notes, refreshNotes}){

  const {logout} = useAuth()

  async function handleDelete(id)
  {
    await api.delete(`/notes/${id}`);
    refreshNotes();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to='/profile' className="text-gray-600 hover:text-gray-900">Profile</Link>
            <button onClick={logout} className="text-gray-600 hover:text-gray-900">Log Out</button>
          </div>
      </nav>

    <div className="max-w-5xl mx-auto px-8 py-8">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          My Notes
        </h2>
        <Link to='/editor' className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">+ New Note</Link>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note)=>(
          <div key={note.id} className={`rounded-xl shadow-sm border p-5 ${getCardColor(note.id)}`}>

            <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
            <div className="text-gray-600 text-sm mb-4 line-clamp-3" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(note.content)}} />

              <div className="flex gap-3 text-sm">
               <button aria-label="Delete note" onClick={()=> handleDelete(note.id)} className="text-red-600 hover:underline"><Trash2 size={16}/></button>

              <Link aria-label="Edit note" to={`/editor/${note.id}`} className="text-blue-600 hover:underline"><Pencil size={16}/></Link>

              </div>
          </div>
        ))}
      </div>
  </div>
  </div>
  )
}

export default Dashboard;

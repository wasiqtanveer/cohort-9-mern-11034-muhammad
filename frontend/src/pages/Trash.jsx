import {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import {Trash2, RotateCcw} from 'lucide-react';
import api from '../api/client.js';
import AppShell from '../components/AppShell.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {validateProps} from '../utils/validateProps.js';

const RETENTION_DAYS = 7

//how long this note has left before the backend purges it on the next trash read
function daysLeft(deletedAt)
{
  const deleted = new Date(deletedAt).getTime()
  if (Number.isNaN(deleted)) return RETENTION_DAYS

  const elapsedDays = (Date.now() - deleted) / (1000 * 60 * 60 * 24)
  //ceil so a note with a few hours left still reads "1 day left" rather than "0"
  return Math.max(0, Math.ceil(RETENTION_DAYS - elapsedDays))
}

function Trash(props){

  //react 19 no longer runs propTypes itself, so the checks are invoked by hand
  validateProps(Trash.propTypes, props, 'Trash')

  const {refreshNotes} = props

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const loadTrash = useCallback(() => {
    api.get('/notes/trash')
      .then((res) => {
        setNotes(res.data.notes)
        setError('')
      })
      .catch(() => {
        //without this a failed fetch just looks like an empty trash
        setNotes([])
        setError('Could not load your trash. Check your connection and try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadTrash()
  }, [loadTrash])

  async function handleRestore(note)
  {
    setError('')
    try {
      await api.patch(`/notes/${note.id}/restore`)
      loadTrash()
      //the dashboard list is stale now that a note is back in it
      refreshNotes()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not restore that note, try again')
    }
  }

  async function confirmDelete()
  {
    const note = pendingDelete
    setPendingDelete(null)
    if (!note) return

    setError('')
    try {
      await api.delete(`/notes/${note.id}/permanent`)
      loadTrash()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete that note, try again')
    }
  }

  return (
    <AppShell>

      <div className='mb-2 flex items-end justify-between gap-4'>
        <h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight text-ink'>Trash</h1>
        {notes.length > 0 && (
          <p className='pb-2 text-sm text-ink/50'>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
        )}
      </div>

      <p className='mb-8 text-sm text-ink/50'>Notes here are deleted for good {RETENTION_DAYS} days after you trash them.</p>

      {error && (
        <p role='alert' className='mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</p>
      )}

      {loading && <p className='text-sm text-ink/50'>Loading...</p>}

      {!loading && notes.length === 0 && !error && (
        <div className='rounded-3xl bg-surface/60 px-6 py-20 text-center'>
          <Trash2 size={30} className='mx-auto mb-4 text-ink/25'/>
          <h2 className='font-semibold text-ink'>Trash is empty</h2>
          <p className='mx-auto mt-1 max-w-xs text-sm text-ink/50'>Notes you delete will wait here before they go for good.</p>
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {notes.map((note)=>(
          //deliberately plain rather than the pastel note colours, so the trash
          //never looks like somewhere your notes still live
          <div key={note.id} className='flex flex-col rounded-2xl bg-surface/70 p-5'>

            <h3 className='mb-2 font-bold text-ink/70 line-clamp-2'>{note.title}</h3>

            <div className='mb-6 flex-1 text-sm text-ink/40 line-clamp-3 break-words' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(note.content)}}/>

            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-ink/40'>
                {daysLeft(note.deleted_at)} {daysLeft(note.deleted_at) === 1 ? 'day' : 'days'} left
              </span>

              <div className='flex items-center gap-1.5'>
                <button aria-label='Delete permanently' onClick={()=> setPendingDelete(note)} className='grid h-8 w-8 place-items-center rounded-full text-ink/50 transition hover:bg-red-50 hover:text-red-600'>
                  <Trash2 size={15}/>
                </button>
                <button aria-label='Restore note' onClick={()=> handleRestore(note)} className='grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition hover:opacity-85'>
                  <RotateCcw size={14}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title='Delete forever?'
        message={`"${pendingDelete?.title ?? ''}" will be gone permanently. This cannot be undone.`}
        confirmLabel='Delete forever'
        onConfirm={confirmDelete}
        onCancel={()=> setPendingDelete(null)}
      />
    </AppShell>
  )
}

Trash.propTypes = {
  //restoring a note puts it back in the dashboard list, which is stale after that
  refreshNotes: PropTypes.func.isRequired,
}

export default Trash;

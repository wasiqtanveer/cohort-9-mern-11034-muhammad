import {Link} from 'react-router-dom';
import {useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import {Pencil, Trash2, Search, Pin, StickyNote, Copy} from 'lucide-react';
import api from '../api/client.js';
import AppShell from '../components/AppShell.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import {validateProps} from '../utils/validateProps.js';

//full literal class strings, tailwind scans the source for these
//so a template like bg-note-${n} would never make it into the build
const cardColors = [
  'bg-note-1',
  'bg-note-2',
  'bg-note-3',
  'bg-note-4',
  'bg-note-5',
  'bg-note-6',
]

function getCardColor(id)
{
  return cardColors[id % cardColors.length]
}

//note content is html, so matching against it raw would hit the tag names.
//a search for "p" would otherwise return every single note
function toPlainText(html)
{
  return (html || '').replace(/<[^>]*>/g, ' ')
}

//missing dates sort as 0 rather than NaN, which would make the comparator inconsistent
function time(value)
{
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

function formatDate(value)
{
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})
}

const sortOptions = [
  {value: 'updated', label: 'Recently updated'},
  {value: 'created', label: 'Recently created'},
  {value: 'title-asc', label: 'Title A–Z'},
  {value: 'title-desc', label: 'Title Z–A'},
]

const searchInOptions = [
  {value: 'both', label: 'Title and text'},
  {value: 'title', label: 'Title only'},
  {value: 'text', label: 'Text only'},
]


function Dashboard(props){

  //react 19 no longer runs propTypes itself, so the checks are invoked by hand
  validateProps(Dashboard.propTypes, props, 'Dashboard')

  const {notes, refreshNotes, notesError, notesLoading} = props

  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchIn, setSearchIn] = useState('both')
  const [sortBy, setSortBy] = useState('updated')
  const [pendingDelete, setPendingDelete] = useState(null)

  //only redone when the notes, the term, the search field or the sort actually change
  const visibleNotes = useMemo(() => {
    const term = search.trim().toLowerCase()

    const filtered = term
      ? notes.filter((note) => {
          const inTitle = note.title.toLowerCase().includes(term)
          if (searchIn === 'title') return inTitle

          const inText = toPlainText(note.content).toLowerCase().includes(term)
          if (searchIn === 'text') return inText

          return inTitle || inText
        })
      : notes

    //copy before sorting, .sort() mutates in place and this array is App's state
    return [...filtered].sort((a, b) => {
      //pinned notes stay on top no matter which sort is picked
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1

      if (sortBy === 'title-asc') return a.title.localeCompare(b.title)
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title)
      if (sortBy === 'created') return time(b.created_at) - time(a.created_at)
      return time(b.updated_at) - time(a.updated_at)
    })
  }, [notes, search, searchIn, sortBy])

  //delete is permanent, so it goes through the confirm dialog rather than firing on click
  async function confirmDelete()
  {
    const note = pendingDelete;
    setPendingDelete(null);
    if (!note) return;

    setError('');
    try {
      await api.delete(`/notes/${note.id}`);
      refreshNotes();
    } catch (err) {
      //otherwise the delete button just silently does nothing
      setError(err.response?.data?.message || 'Could not delete that note, try again');
    }
  }

  async function handleDuplicate(note)
  {
    setError('');
    try {
      //the list already carries the full content so there is nothing to refetch.
      //title is varchar(200) and the api rejects anything longer, hence the slice
      const title = `Copy of ${note.title}`.slice(0, 200);
      await api.post('/notes', {title, content: note.content});
      refreshNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not duplicate that note, try again');
    }
  }

  async function handlePin(note)
  {
    setError('');
    try {
      //send the value we want rather than a toggle, so a double click cant desync
      await api.patch(`/notes/${note.id}/pin`, {is_pinned: !note.is_pinned});
      refreshNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update that pin, try again');
    }
  }

  return (
    <AppShell>

          {/* search and sort, only worth showing once there is something to filter */}
          {notes.length > 0 && (
            <div className='mb-10 flex flex-col gap-3 sm:flex-row sm:items-center'>
              {/* the field and the search-in picker share one pill, so it reads as
                  "searching by this" instead of two unrelated controls sat next to each other */}
              <div className='flex flex-1 items-center rounded-full bg-surface pl-4 pr-2 focus-within:ring-2 focus-within:ring-ink'>
                <Search size={17} className='shrink-0 text-ink/35'/>

                <input
                  type='search'
                  value={search}
                  onChange={(e)=> setSearch(e.target.value)}
                  placeholder='Search'
                  aria-label='Search notes'
                  className='min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none'
                />

                <span aria-hidden='true' className='mr-1 h-5 w-px shrink-0 bg-black/10'/>

                <select
                  value={searchIn}
                  onChange={(e)=> setSearchIn(e.target.value)}
                  aria-label='Search in'
                  className='shrink-0 bg-transparent py-2 text-sm font-medium text-ink/60 focus:outline-none'
                >
                  {searchInOptions.map((option)=>(
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* no fixed width, so the native arrow sits right after the text
                  rather than being pushed out to the far edge of the pill */}
              <select
                value={sortBy}
                onChange={(e)=> setSortBy(e.target.value)}
                aria-label='Sort notes'
                className='rounded-full bg-surface px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink'
              >
                {sortOptions.map((option)=>(
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className='mb-6 flex items-end justify-between gap-4'>
            <h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight text-ink'>Notes</h1>

            {notes.length > 0 && (
              <p className='pb-2 text-sm text-ink/50'>
                {search.trim()
                  ? `${visibleNotes.length} of ${notes.length}`
                  : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
              </p>
            )}
          </div>

          {/* one banner for a failed list fetch, delete or pin */}
          {(error || notesError) && (
            <p role='alert' className='mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>{error || notesError}</p>
          )}

          {/* placeholder cards while the list is in flight. an empty notes array and a
              list we have not fetched yet look the same, so without this the empty
              state below flashes up on every single load */}
          {notesLoading && (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {[1, 2, 3, 4].map((n)=>(
                <div key={n} className='h-44 animate-pulse rounded-2xl bg-surface/50'/>
              ))}
            </div>
          )}

          {!notesLoading && notes.length === 0 && !notesError && (
            <div className='rounded-3xl bg-surface/60 px-6 py-20 text-center'>
              <StickyNote size={30} className='mx-auto mb-4 text-ink/25'/>
              <h2 className='font-semibold text-ink'>No notes yet</h2>
              <p className='mx-auto mt-1 mb-6 max-w-xs text-sm text-ink/50'>Everything you write will show up here.</p>
              <Link to='/editor' className='inline-block rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90'>
                Write your first note
              </Link>
            </div>
          )}

          {notes.length > 0 && visibleNotes.length === 0 && (
            <div className='rounded-3xl bg-surface/60 px-6 py-20 text-center'>
              <Search size={30} className='mx-auto mb-4 text-ink/25'/>
              <h2 className='font-semibold text-ink'>No matches</h2>
              <p className='mt-1 mb-6 text-sm text-ink/50'>Nothing matched &ldquo;{search.trim()}&rdquo;.</p>
              <button onClick={()=> setSearch('')} className='text-sm font-semibold text-ink underline underline-offset-2 hover:no-underline'>
                Clear search
              </button>
            </div>
          )}

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {visibleNotes.map((note)=>(
              <div key={note.id} className={`group relative flex flex-col rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${getCardColor(note.id)}`}>

                {/* stays visible while pinned, otherwise only on hover or keyboard focus */}
                <button
                  type='button'
                  onClick={()=> handlePin(note)}
                  aria-label={note.is_pinned ? 'Unpin note' : 'Pin note'}
                  className={`absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                    note.is_pinned
                      ? 'bg-ink text-white'
                      : 'bg-black/10 text-ink/60 opacity-0 hover:bg-black/20 group-hover:opacity-100 focus-visible:opacity-100'
                  }`}
                >
                  <Pin size={13}/>
                </button>

                {/* pr-9 keeps a long title clear of the pin button */}
                <h3 className='mb-2 pr-9 font-bold text-ink line-clamp-2'>{note.title}</h3>

                <div className='mb-6 flex-1 text-sm text-ink/60 line-clamp-3 break-words' dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(note.content)}}/>

                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-ink/50'>{formatDate(note.updated_at)}</span>

                  <div className='flex items-center gap-1.5'>
                    <button aria-label='Duplicate note' onClick={()=> handleDuplicate(note)} className='grid h-8 w-8 place-items-center rounded-full text-ink/50 transition hover:bg-black/10 hover:text-ink'>
                      <Copy size={15}/>
                    </button>
                    <button aria-label='Delete note' onClick={()=> setPendingDelete(note)} className='grid h-8 w-8 place-items-center rounded-full text-ink/50 transition hover:bg-black/10 hover:text-ink'>
                      <Trash2 size={15}/>
                    </button>
                    <Link aria-label='Edit note' to={`/editor/${note.id}`} className='grid h-8 w-8 place-items-center rounded-full bg-ink text-white transition hover:opacity-85'>
                      <Pencil size={14}/>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title='Move to trash?'
        message={`"${pendingDelete?.title ?? ''}" goes to the trash and is deleted for good after 7 days.`}
        confirmLabel='Move to trash'
        onConfirm={confirmDelete}
        onCancel={()=> setPendingDelete(null)}
      />
    </AppShell>
  )
}

Dashboard.propTypes = {
  notes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    is_pinned: PropTypes.bool,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  })).isRequired,
  refreshNotes: PropTypes.func.isRequired,
  notesError: PropTypes.string,
  notesLoading: PropTypes.bool,
}

export default Dashboard;

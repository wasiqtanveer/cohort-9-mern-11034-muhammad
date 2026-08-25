import {render, screen, waitFor, within, fireEvent} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import NoteEditor from './NoteEditor.jsx';
import api from '../api/client.js';


jest.mock('../api/client.js');

//swap the real quill for a plain textarea, it takes value and calls onChange the same way
jest.mock('react-quill-new', () => {
  return function MockReactQuill({ value, onChange }) {
    return <textarea data-testid="content-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  }
})

function renderEditor(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/editor' element={<NoteEditor refreshNotes={() => {}} />} />
        <Route path='/editor/:id' element={<NoteEditor refreshNotes={() => {}} />} />
        <Route path='/dashboard' element={<p>Dashboard Page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
    jest.clearAllMocks();
});

test('shows "New note" and an empty title field when creating', ()=>{
    renderEditor('/editor')

    //no fetch happens for a brand new note, so no waitFor needed here
    expect(screen.getByText('New note')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('')
})

test('shows "Edit note" and pre-fills the title when editing an existing note', async () => {
  api.get.mockResolvedValue({
    data: { note: { id: 1, title: 'First Note', content: '<p>Hello</p>' } },
  });

  renderEditor('/editor/1')

  //the real title only appears after the GET resolves
  await waitFor(() => expect(screen.getByLabelText('Title')).toHaveValue('First Note'))
  expect(screen.getByText('Edit note')).toBeInTheDocument()
  expect(api.get).toHaveBeenCalledWith('/notes/1')
})

test('shows "Note not found" for an id the backend rejects', async () => {
  //has to look like a real axios 404, a plain error is treated as a connection problem now
  api.get.mockRejectedValue({response: {status: 404}});

  renderEditor('/editor/999')

  await waitFor(() => expect(screen.getByText('Note not found')).toBeInTheDocument())
})

test('shows a connection error instead of "Note not found" when the request fails', async () => {
  //no response object at all is what a network failure looks like
  api.get.mockRejectedValue(new Error('Network Error'));

  renderEditor('/editor/1')

  await waitFor(() => expect(screen.getByText('Could not load this note, try again')).toBeInTheDocument())
  expect(screen.queryByText('Note not found')).not.toBeInTheDocument()
})


test('saving a new note posts it and goes back to the dashboard', async () => {
  api.post.mockResolvedValue({});

  renderEditor('/editor')

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'My note'}})
  fireEvent.change(screen.getByTestId('content-editor'), {target:{value:'<p>hi</p>'}})
  fireEvent.click(screen.getByRole('button', {name:'Save'}))

  await waitFor(()=> expect(api.post).toHaveBeenCalledWith('/notes', {title:'My note', content:'<p>hi</p>'}))
  expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
})


test('saving an existing note puts instead of posting', async () => {
  api.get.mockResolvedValue({data:{note:{id:1, title:'First Note', content:'<p>Hello</p>'}}});
  api.put.mockResolvedValue({});

  renderEditor('/editor/1')

  await waitFor(()=> expect(screen.getByLabelText('Title')).toHaveValue('First Note'))

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'Renamed'}})
  fireEvent.click(screen.getByRole('button', {name:'Save'}))

  await waitFor(()=> expect(api.put).toHaveBeenCalledWith('/notes/1', {title:'Renamed', content:'<p>Hello</p>'}))
  expect(api.post).not.toHaveBeenCalled()
})


test('keeps what you typed on the page when saving fails', async () => {
  api.post.mockRejectedValue({response:{data:{message:'Title is required'}}});

  renderEditor('/editor')

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'My note'}})
  fireEvent.click(screen.getByRole('button', {name:'Save'}))

  expect(await screen.findByRole('alert')).toHaveTextContent('Title is required')
  //losing the typed text on a failed save would be the worst possible outcome
  expect(screen.getByLabelText('Title')).toHaveValue('My note')
  expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
})


test('leaving with unsaved changes asks before discarding', async () => {
  renderEditor('/editor')

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'Half written'}})
  fireEvent.click(screen.getByRole('button', {name:'Back to notes'}))

  expect(await screen.findByText('Discard changes?')).toBeInTheDocument()
})


test('leaving with nothing typed goes straight back', async () => {
  renderEditor('/editor')

  fireEvent.click(screen.getByRole('button', {name:'Back to notes'}))

  expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
  expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument()
})


test('confirming the discard leaves the editor', async () => {
  renderEditor('/editor')

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'Half written'}})
  fireEvent.click(screen.getByRole('button', {name:'Back to notes'}))
  fireEvent.click(await screen.findByRole('button', {name:'Discard'}))

  expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
})


test('cancelling the discard keeps what was typed', async () => {
  renderEditor('/editor')

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'Half written'}})
  fireEvent.click(screen.getByRole('button', {name:'Back to notes'}))

  const dialog = await screen.findByRole('dialog')
  fireEvent.click(within(dialog).getByRole('button', {name:'Cancel'}))

  expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Title')).toHaveValue('Half written')
})


test('cancel leaves straight away when nothing was typed', () => {
  renderEditor('/editor')

  fireEvent.click(screen.getByRole('button', {name:'Cancel'}))

  expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
})


test('cancel asks first when there are unsaved changes', () => {
  renderEditor('/editor')

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'half written'}})
  fireEvent.click(screen.getByRole('button', {name:'Cancel'}))

  expect(screen.getByText('Discard changes?')).toBeInTheDocument()
  expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
})


test('ctrl+s saves without touching the save button', async () => {
  api.post.mockResolvedValue({});

  renderEditor('/editor')

  fireEvent.change(screen.getByLabelText('Title'), {target:{value:'Quick save'}})
  fireEvent.keyDown(document, {key:'s', ctrlKey:true})

  await waitFor(()=> expect(api.post).toHaveBeenCalledWith('/notes', {title:'Quick save', content:''}))
})

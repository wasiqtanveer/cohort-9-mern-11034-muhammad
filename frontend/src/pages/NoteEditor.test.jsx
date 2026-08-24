import {render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import NoteEditor from './NoteEditor.jsx';
import api from '../api/client.js';

jest.mock('../api/client.js');

//jest.mock(modulePath, factory) tells Jest "whenever anything in this test file imports from 'react-quill-new', give them this fake thing instead of the real library." The fake is a simple <textarea> that mimics Quill's actual interface — it receives value and calls onChange with the new value, exactly like the real component does. Your NoteEditor component doesn't know the difference; it just sees something with the right shape.
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
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
    jest.clearAllMocks();
});

test('shows "New Note" and an empty title field when creating', ()=>{
    renderEditor('/editor')

    //no fetch happens for a brand new note, so no waitFor needed here
    expect(screen.getByText('New Note')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('')
})

test('shows "Edit Note" and pre-fills the title when editing an existing note', async () => {
  api.get.mockResolvedValue({
    data: { note: { id: 1, title: 'First Note', content: '<p>Hello</p>' } },
  });

  renderEditor('/editor/1')

  //the real title only appears after the GET resolves
  await waitFor(() => expect(screen.getByLabelText('Title')).toHaveValue('First Note'))
  expect(screen.getByText('Edit Note')).toBeInTheDocument()
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

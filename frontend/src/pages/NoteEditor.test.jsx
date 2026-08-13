import {render, screen} from '@testing-library/react';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import NoteEditor from './NoteEditor.jsx';

//jest.mock(modulePath, factory) tells Jest "whenever anything in this test file imports from 'react-quill-new', give them this fake thing instead of the real library." The fake is a simple <textarea> that mimics Quill's actual interface — it receives value and calls onChange with the new value, exactly like the real component does. Your NoteEditor component doesn't know the difference; it just sees something with the right shape.
jest.mock('react-quill-new', () => {
  return function MockReactQuill({ value, onChange }) {
    return <textarea data-testid="content-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  }
})

const mockNotes = [
  { id: 1, title: 'First Note', content: '<p>Hello</p>' },
]


function renderEditor(path, notes = mockNotes) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/editor' element={<NoteEditor notes={notes} setNotes={() => {}} />} />
        <Route path='/editor/:id' element={<NoteEditor notes={notes} setNotes={() => {}} />} />
      </Routes>
    </MemoryRouter>
  )
}


// test to show url correctly work for new Note
test('shows "New Note" and an empty title field when creating', ()=>{
    renderEditor('/editor')

    expect(screen.getByText('New Note')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('')
})

test('shows "Edit Note" and pre-fills the title when editing an existing note', () => {
  renderEditor('/editor/1')

  expect(screen.getByText('Edit Note')).toBeInTheDocument()
  expect(screen.getByLabelText('Title')).toHaveValue('First Note')
})


test('shows "Note not found" for an id that does not exist', () => {
  renderEditor('/editor/999')//url address for note id 999 which does not exist in mockNotes

  expect(screen.getByText('Note not found')).toBeInTheDocument()
})
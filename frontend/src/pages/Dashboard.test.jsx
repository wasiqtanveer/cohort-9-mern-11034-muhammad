import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {AuthContext} from '../context/Auth-context.js';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import api from '../api/client.js';

jest.mock('../api/client.js');

//First Note is deliberately the more recently updated one, so that the default
//"recently updated" sort renders these in the same order as this array
const mockNotes=[
  { id: 1, title: 'First Note', content: '<p>Hello</p>', is_pinned: false, created_at: '2026-01-02T10:00:00Z', updated_at: '2026-01-02T10:00:00Z' },
  { id: 2, title: 'Second Note', content: '<p>World</p>', is_pinned: false, created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z' },
]

function renderDashboard(notes, refreshNotes, notesLoading = false)
{
    render(
        <AuthContext.Provider value={{logout:()=>{}}}>
            <MemoryRouter>
                <Dashboard notes={notes} refreshNotes={refreshNotes} notesLoading={notesLoading}/>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

beforeEach(() => {
    jest.clearAllMocks();
});

test('renders all notes title',  ()=>
{
    renderDashboard(mockNotes, ()=>{})

  expect(screen.getByText('First Note')).toBeInTheDocument()
  expect(screen.getByText('Second Note')).toBeInTheDocument()
})


test('clicking delete asks for confirmation then moves the note to the trash', async ()=>{
    api.delete.mockResolvedValue({});
    const refreshNotes = jest.fn()
    renderDashboard(mockNotes, refreshNotes)

    fireEvent.click(screen.getAllByLabelText('Delete note')[0])

    //opening the dialog must not reach the server on its own
    expect(api.delete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', {name: 'Move to trash'}))

    //the delete call and the refresh both happen after a click, so wait for them
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/notes/1'))
    expect(refreshNotes).toHaveBeenCalled()
})


test('cancelling the confirm dialog deletes nothing', ()=>{
    const refreshNotes = jest.fn()
    renderDashboard(mockNotes, refreshNotes)

    fireEvent.click(screen.getAllByLabelText('Delete note')[0])
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))

    expect(api.delete).not.toHaveBeenCalled()
    expect(refreshNotes).not.toHaveBeenCalled()
})


test('duplicate posts a copy of the note', async ()=>{
    api.post.mockResolvedValue({});
    const refreshNotes = jest.fn()
    renderDashboard(mockNotes, refreshNotes)

    fireEvent.click(screen.getAllByLabelText('Duplicate note')[0])

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/notes', {
        title: 'Copy of First Note',
        content: '<p>Hello</p>',
    }))
    expect(refreshNotes).toHaveBeenCalled()
})


test('search in title only ignores matches in the content', ()=>{
    renderDashboard(mockNotes, ()=>{})

    fireEvent.change(screen.getByLabelText('Search in'), {target:{value:'title'}})
    //"World" lives in the content of the second note, never in a title
    fireEvent.change(screen.getByLabelText('Search notes'), {target:{value:'world'}})

    expect(screen.getByText('No matches')).toBeInTheDocument()
})


test('search in text only ignores matches in the title', ()=>{
    renderDashboard(mockNotes, ()=>{})

    fireEvent.change(screen.getByLabelText('Search in'), {target:{value:'text'}})
    //"Second" is only ever a title, so text only search should find nothing
    fireEvent.change(screen.getByLabelText('Search notes'), {target:{value:'second'}})

    expect(screen.getByText('No matches')).toBeInTheDocument()
})


test('filters the list by the search box', ()=>{
    renderDashboard(mockNotes, ()=>{})

    fireEvent.change(screen.getByLabelText('Search notes'), {target:{value:'second'}})

    expect(screen.queryByText('First Note')).not.toBeInTheDocument()
    expect(screen.getByText('Second Note')).toBeInTheDocument()
})


test('search looks at content but not at the html tags', ()=>{
    renderDashboard(mockNotes, ()=>{})

    //"World" only exists inside the second note's content
    fireEvent.change(screen.getByLabelText('Search notes'), {target:{value:'world'}})
    expect(screen.getByText('Second Note')).toBeInTheDocument()

    //every note is wrapped in <p>, so this must not match anything
    fireEvent.change(screen.getByLabelText('Search notes'), {target:{value:'p'}})
    expect(screen.getByText('No matches')).toBeInTheDocument()
})


test('reorders the notes when the sort is changed', ()=>{
    renderDashboard(mockNotes, ()=>{})

    fireEvent.change(screen.getByLabelText('Sort notes'), {target:{value:'title-desc'}})

    const titles = screen.getAllByRole('heading', {level:3}).map((h)=> h.textContent)
    expect(titles).toEqual(['Second Note','First Note'])
})


test('clicking pin sends the opposite value and refreshes', async ()=>{
    api.patch.mockResolvedValue({});
    const refreshNotes = jest.fn()
    renderDashboard(mockNotes, refreshNotes)

    fireEvent.click(screen.getAllByLabelText('Pin note')[0])

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/notes/1/pin', {is_pinned: true}))
    expect(refreshNotes).toHaveBeenCalled()
})


test('a pinned note sorts above an unpinned one', ()=>{
    const pinned = [
        mockNotes[0],
        {...mockNotes[1], is_pinned: true},
    ]
    renderDashboard(pinned, ()=>{})

    //Second Note is older by updated_at, the pin is what puts it first
    const titles = screen.getAllByRole('heading', {level:3}).map((h)=> h.textContent)
    expect(titles).toEqual(['Second Note','First Note'])
})


test('shows an empty state when there are no notes', ()=>{
    renderDashboard([], ()=>{})

    expect(screen.getByText('No notes yet')).toBeInTheDocument()
})


test('does not claim the list is empty while it is still loading', ()=>{
    //an unfetched list and a genuinely empty one are both [], so without the
    //loading flag this showed "No notes yet" on every single page load
    renderDashboard([], ()=>{}, true)

    expect(screen.queryByText('No notes yet')).not.toBeInTheDocument()
})

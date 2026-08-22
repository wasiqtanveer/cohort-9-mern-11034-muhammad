import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {AuthContext} from '../context/Auth-context.js';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import api from '../api/client.js';

jest.mock('../api/client.js');

const mockNotes=[
      { id: 1, title: 'First Note', content: '<p>Hello</p>' },
        { id: 2, title: 'Second Note', content: '<p>World</p>' },
]

function renderDashboard(notes, refreshNotes)
{
    render(
        <AuthContext.Provider value={{logout:()=>{}}}>
            <MemoryRouter>
                <Dashboard notes={notes} refreshNotes={refreshNotes}/>
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


test('clicking delete calls the api and refreshes the list', async ()=>{
    api.delete.mockResolvedValue({});
    const refreshNotes = jest.fn()
    renderDashboard(mockNotes, refreshNotes)

    const deleteButtons = screen.getAllByLabelText('Delete note')
    fireEvent.click(deleteButtons[0])

    //the delete call and the refresh both happen after a click, so wait for them
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/notes/1'))
    expect(refreshNotes).toHaveBeenCalled()
})

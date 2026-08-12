import {render, screen, fireEvent} from '@testing-library/react';
import {AuthContext} from '../context/Auth-context.js';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';

const mockNotes=[
      { id: 1, title: 'First Note', content: '<p>Hello</p>' },
        { id: 2, title: 'Second Note', content: '<p>World</p>' },
]

function renderDashboard(notes,setNotes)
{
    render(
        <AuthContext.Provider value={{logout:()=>{}}}>
            <MemoryRouter>
                <Dashboard notes={notes} setNotes={setNotes}/>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}


test('renders all notes title',  ()=>
{
    renderDashboard(mockNotes,()=>{})

    
  expect(screen.getByText('First Note')).toBeInTheDocument()
  expect(screen.getByText('Second Note')).toBeInTheDocument()
})


test('clicking delete claas notes with the notes removed', ()=>{
    const setNotes = jest.fn()
    renderDashboard(mockNotes,setNotes)

    const deleteButtons = screen.getAllByLabelText('Delete note')
    fireEvent.click(deleteButtons[0])
    expect(setNotes).toHaveBeenCalledWith([mockNotes[1]])
})
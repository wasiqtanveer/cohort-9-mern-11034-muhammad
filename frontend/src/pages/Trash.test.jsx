import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {AuthContext} from '../context/Auth-context.js';
import {MemoryRouter} from 'react-router-dom';
import Trash from './Trash.jsx';
import api from '../api/client.js';

jest.mock('../api/client.js');

const trashedNotes = [
  {id: 1, title: 'Deleted One', content: '<p>Hello</p>', deleted_at: new Date().toISOString()},
  {id: 2, title: 'Deleted Two', content: '<p>World</p>', deleted_at: new Date().toISOString()},
]

function renderTrash(notes, refreshNotes = ()=>{})
{
    api.get.mockResolvedValue({data: {notes}})

    render(
        <AuthContext.Provider value={{logout:()=>{}}}>
            <MemoryRouter>
                <Trash refreshNotes={refreshNotes}/>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

beforeEach(() => {
    jest.clearAllMocks();
});

test('lists the notes that are in the trash', async ()=>{
    renderTrash(trashedNotes)

    //the list only appears once the fetch resolves
    expect(await screen.findByText('Deleted One')).toBeInTheDocument()
    expect(screen.getByText('Deleted Two')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/notes/trash')
})


test('shows an empty state when nothing is in the trash', async ()=>{
    renderTrash([])

    expect(await screen.findByText('Trash is empty')).toBeInTheDocument()
})


test('shows how long a note has left before it is purged', async ()=>{
    renderTrash(trashedNotes)

    //deleted just now, so it has the full window left
    expect(await screen.findAllByText('7 days left')).toHaveLength(2)
})


test('restore calls the api and refreshes the dashboard list too', async ()=>{
    api.patch.mockResolvedValue({});
    const refreshNotes = jest.fn()
    renderTrash(trashedNotes, refreshNotes)

    fireEvent.click((await screen.findAllByLabelText('Restore note'))[0])

    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/notes/1/restore'))
    expect(refreshNotes).toHaveBeenCalled()
})


test('deleting forever asks for confirmation first', async ()=>{
    api.delete.mockResolvedValue({});
    renderTrash(trashedNotes)

    fireEvent.click((await screen.findAllByLabelText('Delete permanently'))[0])

    expect(api.delete).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', {name: 'Delete forever'}))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/notes/1/permanent'))
})


test('cancelling the confirm dialog deletes nothing', async ()=>{
    renderTrash(trashedNotes)

    fireEvent.click((await screen.findAllByLabelText('Delete permanently'))[0])
    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))

    expect(api.delete).not.toHaveBeenCalled()
})


test('shows an error instead of an empty trash when the fetch fails', async ()=>{
    api.get.mockRejectedValue(new Error('Network Error'));

    render(
        <AuthContext.Provider value={{logout:()=>{}}}>
            <MemoryRouter>
                <Trash refreshNotes={()=>{}}/>
            </MemoryRouter>
        </AuthContext.Provider>
    )

    expect(await screen.findByText(/Could not load your trash/)).toBeInTheDocument()
    expect(screen.queryByText('Trash is empty')).not.toBeInTheDocument()
})

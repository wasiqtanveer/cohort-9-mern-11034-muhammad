import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Login from './Login.jsx'
import { AuthContext } from '../context/Auth-context'

function renderLogin(login){
    render(
        <AuthContext.Provider value={{login, loading:false}}>
            <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path='/login' element={<Login/>}/>
                <Route path='/dashboard' element={<p>Dashboard Page</p>}/>
            </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

function fillIn(email, password){
    fireEvent.change(screen.getByLabelText('Email'), {target:{value:email}})
    fireEvent.change(screen.getByLabelText('Password'), {target:{value:password}})
}

test('shows the heading and both fields', ()=>
{
    renderLogin(jest.fn())

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Password')).toHaveValue('')
})

test('sends what was typed and goes to the dashboard', async ()=>
{
    const login = jest.fn().mockResolvedValue({})
    renderLogin(login)

    fillIn('a@b.com','password123')
    fireEvent.click(screen.getByRole('button', {name:'Log In'}))

    await waitFor(()=> expect(login).toHaveBeenCalledWith('a@b.com','password123'))
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
})

test('shows the message the backend sent when login fails', async ()=>
{
    const login = jest.fn().mockRejectedValue({response:{data:{message:'Invalid email or password'}}})
    renderLogin(login)

    fillIn('a@b.com','wrongpass')
    fireEvent.click(screen.getByRole('button', {name:'Log In'}))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
    
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
})

test('says the server is unreachable when there is no response at all', async ()=>
{
    
    const login = jest.fn().mockRejectedValue(new Error('Network Error'))
    renderLogin(login)

    fillIn('a@b.com','password123')
    fireEvent.click(screen.getByRole('button', {name:'Log In'}))

    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server')
})

test('the eye button reveals and hides the password', ()=>
{
    renderLogin(jest.fn())

    const field = screen.getByLabelText('Password')
    expect(field).toHaveAttribute('type','password')

    fireEvent.click(screen.getByLabelText('Show password'))
    expect(field).toHaveAttribute('type','text')

    fireEvent.click(screen.getByLabelText('Hide password'))
    expect(field).toHaveAttribute('type','password')
})

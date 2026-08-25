import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Signup from './Signup.jsx'
import { AuthContext } from '../context/Auth-context'

function renderSignup(signup){
    render(
        <AuthContext.Provider value={{signup, loading:false}}>
            <MemoryRouter initialEntries={['/signup']}>
            <Routes>
                <Route path='/signup' element={<Signup/>}/>
                <Route path='/dashboard' element={<p>Dashboard Page</p>}/>
            </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

function fillIn(name, email, password){
    fireEvent.change(screen.getByLabelText('Name'), {target:{value:name}})
    fireEvent.change(screen.getByLabelText('Email'), {target:{value:email}})
    fireEvent.change(screen.getByLabelText('Password'), {target:{value:password}})
}

test('shows the heading and all three fields', ()=>
{
    renderSignup(jest.fn())

    expect(screen.getByText('Create account')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Password')).toHaveValue('')
})

test('sends all three fields and goes to the dashboard', async ()=>
{
    const signup = jest.fn().mockResolvedValue({})
    renderSignup(signup)

    fillIn('Wasiq','a@b.com','password123')
    fireEvent.click(screen.getByRole('button', {name:'Sign Up'}))

    await waitFor(()=> expect(signup).toHaveBeenCalledWith('Wasiq','a@b.com','password123'))
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
})

test('shows the message the backend sent when signup fails', async ()=>
{
    const signup = jest.fn().mockRejectedValue({response:{data:{message:'User with this email already exists'}}})
    renderSignup(signup)

    fillIn('Wasiq','a@b.com','password123')
    fireEvent.click(screen.getByRole('button', {name:'Sign Up'}))

    expect(await screen.findByRole('alert')).toHaveTextContent('User with this email already exists')
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument()
})

test('says the server is unreachable when there is no response at all', async ()=>
{
    const signup = jest.fn().mockRejectedValue(new Error('Network Error'))
    renderSignup(signup)

    fillIn('Wasiq','a@b.com','password123')
    fireEvent.click(screen.getByRole('button', {name:'Sign Up'}))

    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server')
})

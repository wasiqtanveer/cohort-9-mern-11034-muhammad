import{render , screen} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import { AuthContext } from '../context/Auth-context'

function renderwithAuth(user){
    render(
        <AuthContext.Provider value={{user}}>
            <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
                <Route path='/login' element={<p>Login Page</p>}/>
                <Route path='/dashboard' element={
                    <ProtectedRoute>
                        <p>
                            Secret Dashboard
                        </p>
                    </ProtectedRoute>
                }/>
            </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    )
}

test('redirects to login when no user is logged in', ()=>
{
    renderwithAuth(null)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret Dashboard')).not.toBeInTheDocument()
})

test('render children when a user is logged in', ()=>
{
    renderwithAuth({email:'a@b.com'})
    expect(screen.getByText('Secret Dashboard')).toBeInTheDocument()
})
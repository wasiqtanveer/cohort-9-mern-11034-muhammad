import {render, screen, fireEvent} from '@testing-library/react';
import {AuthProvider} from './AuthProvider.jsx';
import {useAuth} from './Auth-context.js';


function TestComponent() {
  const { user, login, logout } = useAuth()
  return (
    <div>
      <p>{user ? `Logged in as ${user.email}` : 'Not logged in'}</p>
      <button onClick={() => login('test@example.com')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}



test('login sets the user, logout clears it', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )



    fireEvent.click(screen.getByText('Login'))
  expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument()

  fireEvent.click(screen.getByText('Logout'))
  expect(screen.getByText('Not logged in')).toBeInTheDocument()
})
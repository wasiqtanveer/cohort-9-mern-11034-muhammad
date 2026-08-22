import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {AuthProvider} from './AuthProvider.jsx';
import {useAuth} from './Auth-context.js';
import api from '../api/client.js';

jest.mock('../api/client.js');

function TestComponent() {
  const { user, loading, login, logout } = useAuth()
  if (loading) return <p>Loading...</p>
  return (
    <div>
      <p>{user ? `Logged in as ${user.email}` : 'Not logged in'}</p>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('login sets the user, logout clears it', async () => {
  api.post.mockResolvedValue({
    data: { token: 'fake-token', user: { email: 'test@example.com' } },
  });

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )

  //wait for the initial session-restore check to finish (no token, so this resolves fast)
  await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument())

  fireEvent.click(screen.getByText('Login'))

  await waitFor(() => expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument())
  expect(localStorage.getItem('token')).toBe('fake-token')

  fireEvent.click(screen.getByText('Logout'))
  expect(screen.getByText('Not logged in')).toBeInTheDocument()
  expect(localStorage.getItem('token')).toBeNull()
})

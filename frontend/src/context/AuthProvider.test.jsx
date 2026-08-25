import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {AuthProvider} from './AuthProvider.jsx';
import {useAuth} from './Auth-context.js';
import api from '../api/client.js';

jest.mock('../api/client.js');

function TestComponent() {
  const { user, loading, login, signup, logout } = useAuth()
  if (loading) return <p>Loading...</p>
  return (
    <div>
      <p>{user ? `Logged in as ${user.email}` : 'Not logged in'}</p>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => signup('Wasiq', 'test@example.com', 'password123')}>Signup</button>
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

test('signup registers then logs straight in', async () => {
  api.post.mockResolvedValue({
    data: { token: 'fake-token', user: { email: 'test@example.com' } },
  });

  render(<AuthProvider><TestComponent /></AuthProvider>)

  await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument())

  fireEvent.click(screen.getByText('Signup'))

  await waitFor(() => expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument())
  //register first, then login, so two calls
  expect(api.post).toHaveBeenCalledTimes(2)
})


test('restores a session from a saved token', async () => {
  localStorage.setItem('token', 'saved-token');
  api.get.mockResolvedValue({data:{user:{email:'back@example.com'}}});

  render(<AuthProvider><TestComponent /></AuthProvider>)

  await waitFor(() => expect(screen.getByText('Logged in as back@example.com')).toBeInTheDocument())
  expect(api.get).toHaveBeenCalledWith('/auth/me')
})


test('drops a saved token the server rejects', async () => {
  localStorage.setItem('token', 'stale-token');
  api.get.mockRejectedValue(new Error('401'));

  render(<AuthProvider><TestComponent /></AuthProvider>)

  await waitFor(() => expect(screen.getByText('Not logged in')).toBeInTheDocument())
  //a token the backend refuses is worse than none, it would fail every request
  expect(localStorage.getItem('token')).toBeNull()
})


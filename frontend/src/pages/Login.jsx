import {Link, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {useAuth} from '../context/Auth-context.js';
import AuthLayout from '../components/AuthLayout.jsx';
import TextField from '../components/TextField.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';

function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {login} = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      

      
      if (!err.response) {
        setError('Cannot reach the server. Is the backend running?')
      } else {
        setError(err.response.data?.message || 'Something went wrong, try again')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return(
    <AuthLayout
      canvas='bg-canvas'
      title='Welcome back'
      subtitle='Log in to get to your notes.'
      error={error}
      footer={<>Don&apos;t have an account? <Link to='/signup' className='font-medium text-ink underline underline-offset-2 hover:no-underline'>Sign up</Link></>}
    >
      <form onSubmit={handleSubmit} className='space-y-3'>

        <TextField
          id='email'
          label='Email'
          type='email'
          value={email}
          onChange={(e)=> setEmail(e.target.value)}
          placeholder='you@example.com'
        />

        <PasswordInput value={password} onChange={(e)=> setPassword(e.target.value)} />

        <SubmitButton submitting={submitting} idleLabel='Log In' busyLabel='Logging in...'/>

      </form>
    </AuthLayout>
  )
}

export default Login;

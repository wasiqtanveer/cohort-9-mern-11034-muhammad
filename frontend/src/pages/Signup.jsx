import {Link, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {useAuth} from '../context/Auth-context.js';
import AuthLayout from '../components/AuthLayout.jsx';
import TextField from '../components/TextField.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import SubmitButton from '../components/SubmitButton.jsx';

function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {signup} = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      //no err.response at all means the request never reached the server
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
      canvas='bg-canvas-alt'
      title='Create account'
      subtitle='Somewhere to put your thoughts.'
      error={error}
      footer={<>Already have an account? <Link to='/login' className='font-medium text-ink underline underline-offset-2 hover:no-underline'>Log in</Link></>}
    >
      <form onSubmit={handleSubmit} className='space-y-3'>

        <TextField
          id='name'
          label='Name'
          value={name}
          onChange={(e)=> setName(e.target.value)}
          placeholder='Your name'
        />

        <TextField
          id='email'
          label='Email'
          type='email'
          value={email}
          onChange={(e)=> setEmail(e.target.value)}
          placeholder='you@example.com'
        />

        <PasswordInput value={password} onChange={(e)=> setPassword(e.target.value)} placeholder='At least 8 characters' />

        <SubmitButton submitting={submitting} idleLabel='Sign Up' busyLabel='Signing up...'/>

      </form>
    </AuthLayout>
  )
}

export default Signup;

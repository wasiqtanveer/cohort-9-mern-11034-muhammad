import {Link, } from 'react-router-dom';
import {useState} from 'react';
import {useAuth} from '../context/Auth-context.js';
import {useNavigate} from 'react-router-dom';

function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  const {login} = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e){
    e.preventDefault()
    login(email,password)
    navigate('/dashboard')
  }

  return(
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'> Login </h1>
        <form onSubmit={handleSubmit} className='space-y-4'>

        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
        id="email"
        type = 'email'
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        placeholder='Email'
        className='w-full border border-gray-300 px-3 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        <label htmlFor="password">Password</label>
        <input
        id="password"
        type='password'
        value={password}
        onChange={(e)  => setPassword(e.target.value)}
        placeholder='Password'
         className='w-full border border-gray-300 px-3 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full'>Log In</button>

        </form>
        <p className="text-sm text-gray-600 mt-4 text-center">
        Don't have an account? <Link to='/signup' className="text-blue-600 hover:underline">Sign up</Link>
      </p>
      </div>
    </div>
  )
}

export default Login;
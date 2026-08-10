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
    <div>
        <h1> Login </h1>
        <form onSubmit={handleSubmit}>

        <label htmlFor="email">Email</label>
        <input
        id="email"
        type = 'email'
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        placeholder='Email'
        />

        <label htmlFor="password">Password</label>
        <input
        id="password"
        type='password'
        value={password}
        onChange={(e)  => setPassword(e.target.value)}
        placeholder='Password'
        />

        <button type='submit'>Log In</button>

        </form>
        <Link to='/signup'>Go to Signup</Link>
    </div>
  )
}

export default Login;
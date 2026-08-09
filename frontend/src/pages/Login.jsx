import {Link, } from 'react-router-dom';
import {useState} from 'react';

function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e){
    e.preventDefault()
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
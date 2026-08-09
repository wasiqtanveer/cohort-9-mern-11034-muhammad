import {Link, Navigate} from 'react-router-dom';
import {useState} from 'react';

function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    console.log('logging in with',email,password)
  }

  return(
    <div>
        <h1> Login </h1>
        <form onSubmit={handleSubmit}>

        <input
        type = 'email'
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        placeholders='Email'
        />

        <input
        type='password'
        value={password}
        onChange={(e)  => setPassword(e.target.value)}
        placeolders='Password'
        />

        <button type='submit'>Log In</button>

        </form>
        <Link to='/signup'>Go to Signup</Link>
    </div>
  )
}

export default Login;
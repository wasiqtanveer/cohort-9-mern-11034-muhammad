import {Link, Navigate} from 'react-router-dom';
import {useState} from 'react';

function Signup(){
    const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e){
    e.preventDefault()
    console.log('logging in with',email,password)
  }

  return(
    <div>
        <h1> Signup </h1>
        <form onSubmit={handleSubmit}>

            <input
            type='name'
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder='Name'
            />
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
        <Link to='/dashboard'>Go to Dashboard</Link>
    </div>
  )
}

export default Signup;
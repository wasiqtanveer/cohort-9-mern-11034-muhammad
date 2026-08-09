import {Link, Navigate} from 'react-router-dom';
import {useState} from 'react';

function Signup(){
    const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e){
    e.preventDefault()
  }

  return(
    <div>
        <h1> Signup </h1>
        <form onSubmit={handleSubmit}>

            <label htmlFor="name">Name</label>
            <input
            id="name"
            type='name'
            value={name}

            onChange={(e)=>setName(e.target.value)}
            placeholder='Name'
            />
        <label htmlFor="email">Email</label>
        <input
        id="email"
        type = 'email'
        value={email}
        onChange={(e)=> setEmail(e.target.value)}
        placeholders='Email'
        />

        <label htmlFor="password">Password</label>
        <input
        id="password"
        type='password'
        value={password}
        onChange={(e)  => setPassword(e.target.value)}
        placeholder='Password'
        />

        <button type='submit'>Sign Up</button>

        </form>
        <Link to='/dashboard'>Go to Dashboard</Link>
    </div>
  )
}

export default Signup;
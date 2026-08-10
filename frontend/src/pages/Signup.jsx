import {Link,} from 'react-router-dom';
import {useState} from 'react';
import {useAuth} from '../context/Auth-context.js';
import {useNavigate} from 'react-router-dom';

function Signup(){
    const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {signup} = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e){
    e.preventDefault()
    signup(name,email,password)
    navigate('/dashboard')
  }

  return(
    <div>
        <h1> Signup </h1>
        <form onSubmit={handleSubmit}>

            <label htmlFor="name">Name</label>
            <input
            id="name"
            type='text'
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

        <button type='submit'>Sign Up</button>

        </form>
        <Link to='/dashboard'>Go to Dashboard</Link>
    </div>
  )
}

export default Signup;
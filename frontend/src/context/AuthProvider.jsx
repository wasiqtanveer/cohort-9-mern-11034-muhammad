import {useState} from 'react';
import { AuthContext } from './Auth-context.js';


export function AuthProvider({children})
{
    const[user, setUser] = useState(null)

    function login(email)
    {
        setUser({email})
    }

    function signup(name,email)
    {
        setUser({name,email})
    }

    function logout()
    {
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{user,login,signup,logout}}>

            {children}

        </AuthContext.Provider>
    )
}
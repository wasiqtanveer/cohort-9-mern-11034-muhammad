import {useState, useEffect} from 'react';
import { rollSessionTheme,clearSessionTheme } from '../Theme/sessionTheme.js';
import { AuthContext } from './Auth-context.js'
import api from '../api/client.js';

export function AuthProvider({children})
{
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token"))) //true until we know if a saved token is still valid

    //on first load, if theres a token from a previous session try to restore it
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
           return;
        }

        api.get("/auth/me")
            .then((res) => {
                
                setUser(res.data.user);
            })
            .catch(() => {
                
                if (localStorage.getItem("token") !== token) return;
                localStorage.removeItem("token");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    async function login(email, password)
    {
        const res = await api.post("/auth/login", {email, password});
        localStorage.setItem("token", res.data.token);
        rollSessionTheme();
        setUser(res.data.user);
    }

    async function signup(name, email, password)
    {
        await api.post("/auth/register", {name, email, password});

        
        try {
            await login(email, password);
        } catch {
            const err = new Error("Your account was created but signing in failed. Try logging in.");
            
            err.response = {data: {message: "Your account was created but signing in failed. Try logging in."}};
            throw err;
        }
    }

    function logout()
    {
        localStorage.removeItem("token");
    clearSessionTheme();
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{user, loading, login, signup, logout}}>

            {children}

        </AuthContext.Provider>
    )
}

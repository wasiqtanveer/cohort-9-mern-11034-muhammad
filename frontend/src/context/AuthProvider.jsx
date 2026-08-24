import {useState, useEffect} from 'react';
import { AuthContext } from './Auth-context.js'
import api from '../api/client.js';
import {rollSessionTheme, clearSessionTheme} from '../theme/sessionTheme.js';

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
                //if someone logged in while this was still in flight, dont overwrite the newer session
                if (localStorage.getItem("token") !== token) return;
                setUser(res.data.user);
            })
            .catch(() => {
                //token expired or invalid, throw it away, but only if its still the one we checked
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
        //new pair of page colours for every session
        rollSessionTheme();
        setUser(res.data.user);
    }

    async function signup(name, email, password)
    {
        await api.post("/auth/register", {name, email, password});

        //register doesnt return a token so log in right after. if THIS half fails the
        //account already exists, and the raw error would tell them their details were
        //wrong, which is misleading. say what actually happened instead
        try {
            await login(email, password);
        } catch {
            const err = new Error("Your account was created but signing in failed. Try logging in.");
            //shaped like an axios error so the auth pages can read it the same way
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

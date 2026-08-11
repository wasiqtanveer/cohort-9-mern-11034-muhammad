import { Link } from "react-router-dom";
import {useAuth} from '../context/Auth-context.js';

function Profile()
{
    const{user,logout} = useAuth();

    return(
        <div>

            <h1>Profile</h1>

            <p>Name: {user?.name ?? 'Not Set'}</p>
            <p>Email: {user?.email}</p>

            <button onClick={logout}>Logout</button>
            <Link to='/dashboard'>Back to Dashboard</Link>
        </div>
    )
}

export default Profile
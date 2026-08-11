import { Link } from "react-router-dom";
import {useAuth} from '../context/Auth-context.js';


function Profile()
{
    const{user,logout} = useAuth();

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

            <p className="text-gray-700 mb-2">Name: {user?.name ?? 'Not Set'}</p>
            <p className="text-gray-700 mb-6">Email: {user?.email}</p>

            <div className="flex gap-3">
              <button onClick={logout} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Logout</button>
              <Link to='/dashboard' className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Back to Dashboard</Link>
            </div>

          </div>
        </div>
    )

}

export default Profile
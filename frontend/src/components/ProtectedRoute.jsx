import PropTypes from "prop-types";
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/Auth-context.js';
import { validateProps } from "../utils/validateProps";

function ProtectedRoute(props)
{
    validateProps(ProtectedRoute.propTypes, props, 'ProtectedRoute');

    const {children} = props

    const {user, loading} = useAuth()

    if (loading) {
        return <p>Loading...</p>
    }

    if(!user)
    {
        return <Navigate to='/login' replace/>
    }
    return children;
}


// props for expected route 
ProtectedRoute.propTypes = {
  children: PropTypes.any.isRequired,
}

export default ProtectedRoute;

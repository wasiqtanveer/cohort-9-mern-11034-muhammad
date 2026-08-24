import PropTypes from 'prop-types';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/Auth-context.js';
import {validateProps} from '../utils/validateProps.js';

function ProtectedRoute(props)
{
    //react 19 no longer runs propTypes itself, so the checks are invoked by hand
    validateProps(ProtectedRoute.propTypes, props, 'ProtectedRoute')

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

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

export default ProtectedRoute;
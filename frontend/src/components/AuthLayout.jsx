import PropTypes from "prop-types";
import Doodles from "./Doodles.jsx";
import { validateProps } from "../utils/validateProps";

//same layout was used for login and signup, so keeping it here
function AuthLayout(props)
{
    validateProps(AuthLayout.propTypes, props, 'AuthLayout');

    const {canvas, title, subtitle, error, children, footer} = props

    return (
    <div className={`relative min-h-screen ${canvas} flex items-center justify-center overflow-hidden p-6`}>

      <Doodles />

      
      <div className='relative w-full max-w-md bg-surface rounded-3xl p-8 sm:p-10 shadow-[0_24px_60px_-15px_rgba(24,24,27,0.35)]'>

        <div className='flex items-center gap-2 mb-6'>
          <span className='h-2.5 w-2.5 rounded-full bg-[#ff7f5c]'/>
          <p className='text-sm font-semibold text-ink'>Notely</p>
        </div>

        <h1 className='text-4xl font-extrabold tracking-tight leading-[1.05] text-ink mb-2'>{title}</h1>
        <p className='text-base text-gray-500 mb-6'>{subtitle}</p>

        {error && (
          <p role='alert' className='text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-5'>{error}</p>
        )}

        {children}

        <p className='text-sm text-gray-500 mt-6 text-center'>{footer}</p>

      </div>
    </div>
  )
}


/*props expected by the AuthLayout component*/
AuthLayout.propTypes = {
  canvas: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  error: PropTypes.string,
  children: PropTypes.any.isRequired,
  footer: PropTypes.any.isRequired,
}

export default AuthLayout;

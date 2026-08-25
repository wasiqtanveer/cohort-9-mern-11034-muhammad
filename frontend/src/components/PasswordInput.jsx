import { useState } from "react";
import PropTypes from "prop-types";
import { Eye, EyeOff } from "lucide-react";
import { validateProps } from "../utils/validateProps";

function PasswordInput(props)
{
    validateProps(PasswordInput.propTypes, props, 'PasswordInput');

    const {id = 'password', label = 'Password', value, onChange, placeholder = '••••••••'} = props

    const [visible, setVisible] = useState(false)

    return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-ink mb-1'>{label}</label>

      {/* relative so the eye can sit inside the input */}
      <div className='relative'>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className='w-full bg-gray-100 rounded-xl px-4 py-3 pr-11 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ink'
        />

        {/* type=button or clicking the eye submits the form */}
        <button
          type='button'
          onClick={()=> setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink'
        >
          {visible ? <EyeOff size={17}/> : <Eye size={17}/>}
        </button>
      </div>
    </div>
  )
}


/*props expected by the PasswordInput component*/
PasswordInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}


export default PasswordInput;

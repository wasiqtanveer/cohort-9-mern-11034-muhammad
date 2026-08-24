import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';

//shared by login and signup so the markup only exists once.
//the visible state lives in here because neither page needs to know about it
function PasswordInput({id = 'password', label = 'Password', value, onChange, placeholder = '••••••••'}){

  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-ink mb-1'>{label}</label>

      {/* relative so the toggle can sit inside the input */}
      <div className='relative'>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          //pr-11 keeps a long password from running underneath the icon
          className='w-full bg-gray-100 rounded-xl px-4 py-3 pr-11 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ink'
        />

        {/* type=button matters, a button inside a form defaults to submit
            and clicking the eye would try to log in instead */}
        <button
          type='button'
          onClick={()=> setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          //focus-visible not focus, so the ring shows for keyboard users but not on a mouse click
          className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink'
        >
          {visible ? <EyeOff size={17}/> : <Eye size={17}/>}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput;

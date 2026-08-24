import PropTypes from 'prop-types';
import {validateProps} from '../utils/validateProps.js';

//labelled text input. same shape and spacing as PasswordInput so the fields
//in a form line up whichever of the two you use
function TextField(props){

  //react 19 no longer runs propTypes itself, so the checks are invoked by hand
  validateProps(TextField.propTypes, props, 'TextField')

  const {id, label, type = 'text', value, onChange, placeholder} = props

  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-ink mb-1'>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ink'
      />
    </div>
  )
}

TextField.propTypes = {
  //also used as the label's htmlFor, so it has to be unique on the page
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  //controlled input, so value and onChange always travel together
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}

export default TextField;

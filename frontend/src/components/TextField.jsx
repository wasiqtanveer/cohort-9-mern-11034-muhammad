import PropTypes from "prop-types";
import { validateProps } from "../utils/validateProps";

function TextField(props)
{
    validateProps(TextField.propTypes, props, 'TextField');

    const {id,label,type = 'text', value,onChange,placeholder} = props

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


/*props expected by the TextField component*/
TextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}


export default TextField;
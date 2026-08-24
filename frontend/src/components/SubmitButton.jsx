import PropTypes from 'prop-types';
import {validateProps} from '../utils/validateProps.js';

//the full width dark submit button both auth forms end with
function SubmitButton(props){

  //react 19 no longer runs propTypes itself, so the checks are invoked by hand
  validateProps(SubmitButton.propTypes, props, 'SubmitButton')

  const {submitting, idleLabel, busyLabel} = props

  return (
    <button
      type='submit'
      disabled={submitting}
      className='w-full bg-ink text-white text-sm font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.99] transition disabled:opacity-40 disabled:active:scale-100'
    >
      {submitting ? busyLabel : idleLabel}
    </button>
  )
}

SubmitButton.propTypes = {
  //disables the button and swaps the label while a request is in flight
  submitting: PropTypes.bool.isRequired,
  idleLabel: PropTypes.string.isRequired,
  busyLabel: PropTypes.string.isRequired,
}

export default SubmitButton;

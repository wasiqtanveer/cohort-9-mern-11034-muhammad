import PropTypes from 'prop-types';
import {validateProps} from '../utils/validateProps.js';

function SubmitButton(props)
{
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

  //disable all the buton while the request is o going
  SubmitButton.propTypes = 
{
  submitting: PropTypes.bool.isRequired ,
   idleLabel: PropTypes.string.isRequired,
    busyLabel: PropTypes.string.isRequired,
}

export default SubmitButton;
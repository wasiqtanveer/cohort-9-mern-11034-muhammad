//the full width dark submit button both auth forms end with
function SubmitButton({submitting, idleLabel, busyLabel}){

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

export default SubmitButton;

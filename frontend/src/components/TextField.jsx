//labelled text input. same shape and spacing as PasswordInput so the fields
//in a form line up whichever of the two you use
function TextField({id, label, type = 'text', value, onChange, placeholder}){

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

export default TextField;

import {useEffect, useRef} from 'react';

//generic confirm, used before anything destructive.
//renders nothing at all when closed so it stays out of the accessibility tree
function ConfirmDialog({open, title, message, confirmLabel = 'Delete', onConfirm, onCancel}){

  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return

    //escape should back out, same as clicking cancel
    function handleKey(e) {
      if (e.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKey)

    //move focus into the dialog or a keyboard user is still stuck out on the page behind it
    confirmRef.current?.focus()

    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-6'>

      {/* clicking the backdrop cancels. aria-hidden and not a button on purpose,
          otherwise screen readers announce a second Cancel next to the real one.
          escape and the Cancel button are the keyboard routes out */}
      <div
        aria-hidden='true'
        onClick={onCancel}
        className='absolute inset-0 bg-ink/40'
      />

      <div role='dialog' aria-modal='true' aria-labelledby='confirm-title' className='relative w-full max-w-sm rounded-3xl bg-surface p-7 shadow-[0_24px_60px_-15px_rgba(24,24,27,0.45)]'>

        <h2 id='confirm-title' className='text-lg font-bold text-ink'>{title}</h2>
        <p className='mt-2 mb-6 text-sm text-ink/60'>{message}</p>

        <div className='flex gap-2'>
          <button
            type='button'
            onClick={onCancel}
            className='flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-ink transition hover:bg-gray-200'
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type='button'
            onClick={onConfirm}
            className='flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink'
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog;

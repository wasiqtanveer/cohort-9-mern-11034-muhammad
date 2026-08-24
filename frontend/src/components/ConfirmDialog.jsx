import {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {validateProps} from '../utils/validateProps.js';

//generic confirm, used before anything destructive.
//renders nothing at all when closed so it stays out of the accessibility tree
function ConfirmDialog(props){

  //react 19 no longer runs propTypes itself, so the checks are invoked by hand
  validateProps(ConfirmDialog.propTypes, props, 'ConfirmDialog')

  const {open, title, message, confirmLabel = 'Delete', onConfirm, onCancel} = props

  const panelRef = useRef(null)
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return

    //remember what had focus so it can be handed back when the dialog closes
    const openedFrom = document.activeElement

    function handleKey(e) {
      //escape should back out, same as clicking cancel
      if (e.key === 'Escape') {
        onCancel()
        return
      }

      if (e.key !== 'Tab') return

      //aria-modal does not actually trap focus, so tab would otherwise walk out
      //of the dialog and onto the page controls sitting behind it
      const focusable = panelRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      //wrap around at both ends so focus stays inside the panel
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)

    //move focus into the dialog or a keyboard user is still stuck out on the page behind it
    confirmRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKey)
      //put focus back where it came from rather than dumping it on the body
      if (openedFrom instanceof HTMLElement) openedFrom.focus()
    }
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

      <div ref={panelRef} role='dialog' aria-modal='true' aria-labelledby='confirm-title' className='relative w-full max-w-sm rounded-3xl bg-surface p-7 shadow-[0_24px_60px_-15px_rgba(24,24,27,0.45)]'>

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

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default ConfirmDialog;

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { validateProps } from "../utils/validateProps";

//generic confirm box, used before anything that deletes something
function ConfirmDialog(props)
{
    validateProps(ConfirmDialog.propTypes, props, 'ConfirmDialog');

    const {open, title, message, confirmLabel = 'Delete', onConfirm, onCancel} = props

    const panelRef = useRef(null)
    const confirmRef = useRef(null)

    useEffect(() => {
        if (!open) return

       
        const openedFrom = document.activeElement

        function handleKey(e) {
            if (e.key === 'Escape') {
                onCancel()
                return
            }

            if (e.key !== 'Tab') return

           
            const focusable = panelRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            if (!focusable || focusable.length === 0) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            //wrap at both ends so focus stays inside
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKey)

        confirmRef.current?.focus()

        return () => {
            document.removeEventListener('keydown', handleKey)
            if (openedFrom instanceof HTMLElement) openedFrom.focus()
        }
    }, [open, onCancel])

    if (!open) return null

    return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-6'>

     
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


/*props expected by the ConfirmDialog component*/
ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}


export default ConfirmDialog;

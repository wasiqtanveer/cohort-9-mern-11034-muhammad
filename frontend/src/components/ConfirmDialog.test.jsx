import {render, screen, fireEvent} from '@testing-library/react'
import ConfirmDialog from './ConfirmDialog.jsx'

function renderDialog(overrides){
    const props = {
        open: true,
        title: 'Delete this?',
        message: 'This cannot be undone.',
        confirmLabel: 'Delete',
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
        ...overrides,
    }
    render(<ConfirmDialog {...props}/>)
    return props
}

test('renders nothing at all when closed', ()=>
{
    renderDialog({open:false})
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('shows the title and message when open', ()=>
{
    renderDialog()
    expect(screen.getByText('Delete this?')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
})

test('the two buttons call their own handlers', ()=>
{
    const props = renderDialog()

    fireEvent.click(screen.getByRole('button', {name:'Delete'}))
    expect(props.onConfirm).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', {name:'Cancel'}))
    expect(props.onCancel).toHaveBeenCalled()
})

test('escape backs out the same as cancel', ()=>
{
    const props = renderDialog()

    fireEvent.keyDown(document, {key:'Escape'})

    expect(props.onCancel).toHaveBeenCalled()
})

test('focus moves onto the confirm button when it opens', ()=>
{
    renderDialog()
    expect(screen.getByRole('button', {name:'Delete'})).toHaveFocus()
})

test('tab from the last control wraps back inside the dialog', ()=>
{
    renderDialog()

    const confirm = screen.getByRole('button', {name:'Delete'})
    const cancel = screen.getByRole('button', {name:'Cancel'})

    confirm.focus()
    fireEvent.keyDown(document, {key:'Tab'})

    
    expect(cancel).toHaveFocus()
})

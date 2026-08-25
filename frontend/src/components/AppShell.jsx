import PropTypes from "prop-types";
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '../context/Auth-context.js';
import {Plus, User, LogOut, Trash2, StickyNote} from 'lucide-react';
import { getCanvasClass } from "../Theme/sessionTheme.js";
import { validateProps } from "../utils/validateProps";

//rail and page frame shared by the dashboard and the trash
function AppShell(props)
{
    validateProps(AppShell.propTypes, props, 'AppShell');

    const {children, canvas = 'dashboard'} = props

    const {logout} = useAuth()
    const {pathname} = useLocation()

    
    function navClass(active)
    {
        return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            active ? 'bg-black/5 text-ink' : 'text-ink/60 hover:bg-black/5 hover:text-ink'
        }`
    }

    return (
    <div className={`min-h-screen ${getCanvasClass(canvas)}`}>

      {/* the rail, desktop only */}
      <aside className='hidden sm:flex fixed inset-y-0 left-0 w-44 flex-col justify-between bg-surface px-4 py-6'>
        <div>
          <div className='mb-8 flex items-center gap-2 px-2'>
            <span className='h-2.5 w-2.5 rounded-full bg-[#ff7f5c]'/>
            <span className='text-base font-bold tracking-tight text-ink'>Notely</span>
          </div>

         
          <Link to='/editor' className='flex items-center gap-3 rounded-full bg-ink px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-85 active:scale-[0.98]'>
            <Plus size={17}/>
            New note
          </Link>

          <nav className='mt-6 flex flex-col gap-1'>
            <Link to='/dashboard' className={navClass(pathname === '/dashboard')}>
              <StickyNote size={17}/>
              Notes
            </Link>
            <Link to='/trash' className={navClass(pathname === '/trash')}>
              <Trash2 size={17}/>
              Trash
            </Link>
          </nav>
        </div>

        <div className='flex flex-col gap-1'>
          <Link to='/profile' className={navClass(pathname === '/profile')}>
            <User size={17}/>
            Profile
          </Link>
          <button onClick={logout} className={navClass(false)}>
            <LogOut size={17}/>
            Log out
          </button>
        </div>
      </aside>

        {/* mobile header */}
      <header className='flex sm:hidden items-center justify-between bg-surface px-5 py-4'>
        <div className='flex items-center gap-2'>
          <span className='h-2.5 w-2.5 rounded-full bg-[#ff7f5c]'/>
          <span className='text-base font-bold tracking-tight text-ink'>Notely</span>
        </div>
        <div className='flex items-center gap-1'>
         
          <Link to='/dashboard' aria-label='Notes' className='grid h-9 w-9 place-items-center rounded-lg text-ink/50 hover:text-ink'>
            <StickyNote size={18}/>
          </Link>
          <Link to='/editor' aria-label='New note' className='grid h-9 w-9 place-items-center rounded-lg text-ink/50 hover:text-ink'>
            <Plus size={18}/>
          </Link>
          <Link to='/trash' aria-label='Trash' className='grid h-9 w-9 place-items-center rounded-lg text-ink/50 hover:text-ink'>
            <Trash2 size={18}/>
          </Link>
          <Link to='/profile' aria-label='Profile' className='grid h-9 w-9 place-items-center rounded-lg text-ink/50 hover:text-ink'>
            <User size={18}/>
          </Link>
          <button onClick={logout} aria-label='Log out' className='grid h-9 w-9 place-items-center rounded-lg text-ink/50 hover:text-ink'>
            <LogOut size={18}/>
          </button>
        </div>
      </header>

      <main className='sm:pl-44'>
        <div className='mx-auto max-w-6xl px-5 sm:px-10 py-8'>
          {children}
        </div>
      </main>
    </div>
  )
}


/*props expected by the AppShell component*/
AppShell.propTypes = {
    children: PropTypes.any.isRequired,
  canvas: PropTypes.oneOf(['dashboard', 'profile']),
}


export default AppShell;

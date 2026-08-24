import {Link} from 'react-router-dom';
import {useAuth} from '../context/Auth-context.js';
import {ArrowLeft, LogOut} from 'lucide-react';
import {getCanvasClass} from '../theme/sessionTheme.js';

function Profile()
{
    const {user, logout} = useAuth();

    return(
        //rolled at login, and deliberately a different colour to the dashboard
        <div className={`min-h-screen ${getCanvasClass('profile')}`}>

          <div className='mx-auto max-w-2xl px-5 sm:px-10 py-8'>

            <Link to='/dashboard' className='mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition hover:text-ink'>
              <ArrowLeft size={16}/>
              Back to notes
            </Link>

            <h1 className='mb-8 text-4xl sm:text-5xl font-extrabold tracking-tight text-ink'>Profile</h1>

            <div className='rounded-3xl bg-surface p-7 sm:p-9'>

              <div className='mb-7 flex items-center gap-4'>
                {/* first letter of the name as a stand in avatar */}
                <span className='grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-xl font-bold text-white'>
                  {user?.name?.trim()?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
                <div className='min-w-0'>
                  <p className='truncate text-lg font-bold text-ink'>{user?.name ?? 'Not set'}</p>
                  <p className='truncate text-sm text-ink/50'>{user?.email ?? ''}</p>
                </div>
              </div>

              <dl className='space-y-4 border-t border-black/5 pt-6'>
                <div className='flex items-baseline justify-between gap-4'>
                  <dt className='text-sm text-ink/50'>Name</dt>
                  <dd className='truncate text-sm font-medium text-ink'>{user?.name ?? 'Not set'}</dd>
                </div>
                <div className='flex items-baseline justify-between gap-4'>
                  <dt className='text-sm text-ink/50'>Email</dt>
                  <dd className='truncate text-sm font-medium text-ink'>{user?.email ?? 'Not set'}</dd>
                </div>
              </dl>

              <button
                onClick={logout}
                className='mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99]'
              >
                <LogOut size={16}/>
                Log out
              </button>

            </div>
          </div>
        </div>
    )
}

export default Profile

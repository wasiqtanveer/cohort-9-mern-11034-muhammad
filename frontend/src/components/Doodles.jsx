function Doodles(){

    //doodels are just for fun, they are not part of the app functionality, so we can ignore them in tests and accessibility checks.
    // cpoied the file from previous project since, it not related ot logic tahts why copied it
  return (
    <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden text-ink/20'>

      {/* squiggle, top left */}

      <svg className='absolute left-[10%] top-[16%] w-16 -rotate-6' viewBox='0 0 48 16' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
          <path d='M1 8 C 6 1, 11 15, 16 8 C 21 1, 26 15, 31 8 C 36 1, 41 15, 46 8'/>
      
      </svg>

      {/* four point sparkle, top right */}
      <svg className='absolute right-[14%] top-[12%] w-9 rotate-12' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M12 0 Q13 11 24 12 Q13 13 12 24 Q11 13 0 12 Q11 11 12 0 Z'/>
      
      </svg>



      {/* spiral, bottom left */}

      <svg className='absolute left-[14%] bottom-[18%] w-12 rotate-[14deg]' viewBox='0 0 32 32' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
        <path d='M16 16 C16 12, 12 12, 12 16 C12 21, 19 21, 19 15 C19 8, 10 8, 10 16 C10 25, 22 25, 22 15'/>
      </svg>

      {/* curved arrow, bottom right */}
      <svg className='absolute right-[11%] bottom-[20%] w-16 -rotate-12' viewBox='0 0 48 20' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M2 3 C 14 24, 32 24, 45 7'/>

        <path d='M37 6 L45 7 L41 14'/>
      </svg>


      {/* asterisk, mid left, hidden on small screens so it doesnt crowd the card */}
      <svg className='absolute left-[6%] top-[52%] hidden w-7 sm:block' viewBox='0 0 20 20' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
        <path d='M10 2 V18 M3 6 L17 14 M17 6 L3 14'/>
      </svg>
    </div>
  )
}

export default Doodles
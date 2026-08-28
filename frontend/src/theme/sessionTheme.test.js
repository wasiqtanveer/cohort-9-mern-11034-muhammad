import {rollSessionTheme, clearSessionTheme, getCanvasClass} from './sessionTheme.js'

beforeEach(()=>{
    localStorage.clear()
})

test('rolls two different indexes', ()=>
{
    const pair = rollSessionTheme()
    expect(pair.dashboard).not.toEqual(pair.profile)
})

test('dashboard and profile never get the same colour', ()=>
{
    rollSessionTheme()
    expect(getCanvasClass('dashboard')).not.toEqual(getCanvasClass('profile'))
})

test('the same colour comes back on repeated reads', ()=>
{
    rollSessionTheme()
    const first = getCanvasClass('dashboard')
    expect(getCanvasClass('dashboard')).toEqual(first)
})

test('rerolls when the saved value is not valid json', ()=>
{
    
    const originalWarn = console.warn
    console.warn = () => {}

    try {
        localStorage.setItem('sessionTheme', 'not json at all')

        expect(getCanvasClass('dashboard')).toMatch(/^bg-canvas-[1-6]$/)
    } finally {
        console.warn = originalWarn
    }
})

test('rerolls when the saved indexes are out of range', ()=>
{
    
    localStorage.setItem('sessionTheme', JSON.stringify({dashboard:-1, profile:99}))

    expect(getCanvasClass('dashboard')).toMatch(/^bg-canvas-[1-6]$/)
    expect(getCanvasClass('profile')).toMatch(/^bg-canvas-[1-6]$/)

    
    const saved = JSON.parse(localStorage.getItem('sessionTheme'))
    expect(saved.dashboard).toBeGreaterThanOrEqual(0)
    expect(saved.dashboard).toBeLessThan(6)
    expect(saved.profile).toBeGreaterThanOrEqual(0)
    expect(saved.profile).toBeLessThan(6)
    expect(saved.dashboard).not.toEqual(saved.profile)
})

test('clear removes the saved pair', ()=>
{
    rollSessionTheme()
    clearSessionTheme()

    expect(localStorage.getItem('sessionTheme')).toBeNull()
})

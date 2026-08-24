//full literal class strings, tailwind scans the source for these.
//a template like bg-canvas-${n} would never make it into the build
const canvasClasses = [
  'bg-canvas-1',
  'bg-canvas-2',
  'bg-canvas-3',
  'bg-canvas-4',
  'bg-canvas-5',
  'bg-canvas-6',
]

const STORAGE_KEY = 'sessionTheme'


//localStorage throws outright in some private browsing modes and when a browser is
//set to block site data. these three keep that in one place, and treat storage as
//best effort. losing it only costs you a reroll of the page colours
function readStored()
{
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch (err) {
    console.warn('sessionTheme: could not read saved colours', err.message)
    return null
  }
}

function writeStored(value)
{
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch (err) {
    console.warn('sessionTheme: could not save colours, they will reroll on reload', err.message)
  }
}

function clearStored()
{
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn('sessionTheme: could not clear saved colours', err.message)
  }
}


//localStorage is editable by hand, so anything read back has to be checked
function isValidIndex(value)
{
  return Number.isInteger(value) && value >= 0 && value < canvasClasses.length
}


//picks two different indexes. adding 1 when b lands on or after a shifts it past a,
//which guarantees they differ without looping until they happen to.
//
//Math.random is not cryptographically secure and does not need to be. this picks
//which pastel a page sits on, it protects nothing and is not a token or an id
function pickPair()
{
  const a = Math.floor(Math.random() * canvasClasses.length)
  let b = Math.floor(Math.random() * (canvasClasses.length - 1))
  if (b >= a) b += 1
  return {dashboard: a, profile: b}
}


//called on login and signup so every session gets a new pair
export function rollSessionTheme()
{
  const pair = pickPair()
  writeStored(JSON.stringify(pair))
  return pair
}


export function clearSessionTheme()
{
  clearStored()
}


//a refresh restores the session from the token without going through login,
//so this rolls a pair if there isnt a usable one saved
function readPair()
{
  const raw = readStored()
  if (!raw) return rollSessionTheme()

  try {
    const pair = JSON.parse(raw)

    //typeof alone lets -1 and 1.5 through, and canvasClasses[-1] is undefined,
    //which would render the page with no background at all
    if (!isValidIndex(pair?.dashboard) || !isValidIndex(pair?.profile) || pair.dashboard === pair.profile) {
      return rollSessionTheme()
    }
    return pair
  } catch (err) {
    console.warn('sessionTheme: saved colours were not valid JSON, rerolling', err.message)
    return rollSessionTheme()
  }
}


//page is 'dashboard' or 'profile'
export function getCanvasClass(page)
{
  const pair = readPair()
  const index = pair[page] ?? 0
  return canvasClasses[index % canvasClasses.length]
}

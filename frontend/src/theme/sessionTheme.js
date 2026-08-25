//full class strings on purpose
const canvasClasses = [
  'bg-canvas-1',
  'bg-canvas-2',
  'bg-canvas-3',
  'bg-canvas-4',
  'bg-canvas-5',
  'bg-canvas-6',
]

const STORAGE_KEY = 'sessionTheme'


//localStorage throws in private mode
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


//anyone can edit localStorage by hand so whatever comes back has to be checked
function isValidIndex(value)
{
  return Number.isInteger(value) && value >= 0 && value < canvasClasses.length
}




function randomIndex(max)
{
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % max
}


function pickPair()
{
  const a = randomIndex(canvasClasses.length)
  let b = randomIndex(canvasClasses.length - 1)
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


//a refresh restores the session from the token without hitting login, so roll one if nothing is saved
function readPair()
{
  const raw = readStored()
  if (!raw) return rollSessionTheme()

  try {
    const pair = JSON.parse(raw)

    //typeof lets -1 and 1.5 through and canvasClasses[-1] is undefined, page would have no bg
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

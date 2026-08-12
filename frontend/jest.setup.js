import { TextEncoder, TextDecoder } from 'node:util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

import '@testing-library/jest-dom'

// Adds matchers for testing elements in the DOM,
// such as toBeInTheDocument() and toHaveTextContent().
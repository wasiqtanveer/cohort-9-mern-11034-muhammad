import checkPropTypes from 'prop-types/checkPropTypes';

//react 19 removed runtime propTypes validation, so a Component.propTypes block on
//its own is now dead decoration that never runs. this invokes the same checks by
//hand, which is what the react 19 upgrade guide recommends when you are not on
//typescript. components call it with the props they actually received.
//
//skipped in production builds, so the checks cost nothing in the shipped bundle
export function validateProps(propTypes, props, componentName)
{
  //optional chaining because import.meta.env is a vite global. under jest it is
  //undefined, which falls through to running the checks, and that is what we want
  //in tests anyway
  if (import.meta.env?.PROD) return

  checkPropTypes(propTypes, props, 'prop', componentName)
}

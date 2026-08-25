import checkPropTypes from 'prop-types/checkPropTypes';

//React 19 removed automatic propTypes checks,,..soo we run the checks manually to catch invalid props.
export function validateProps(propTypes, props, componentName)
{
  // Don't run prop validation in production..., import.meta.env if  available in Vite, while in Jest it can be undefined.
  if (import.meta.env?.PROD) return

  checkPropTypes(propTypes, props, 'prop', componentName)
}
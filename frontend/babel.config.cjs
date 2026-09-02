module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
}


//jest runs code in node envirmoent, but since our files use JSX, we need to first convertour code to JS..., BABEL will help us in doing so 

//preset-env handles imports

//preset-react handles JSX syntax
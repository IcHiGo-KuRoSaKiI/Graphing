module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-prefixwrap')('.graphing-root', {
      ignoredSelectors: [/\.react-flow__/]
    }),
    require('autoprefixer'),
  ]
}

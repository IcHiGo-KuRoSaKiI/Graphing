const fs = require('fs');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const prefixwrap = require('postcss-prefixwrap');
const cssnano = require('cssnano');

const input = 'src/index.css';
const output = 'dist/graphing.css';

async function build() {
  const css = fs.readFileSync(input, 'utf8');
  const result = await postcss([
    tailwindcss,
    autoprefixer,
    prefixwrap('.graphing-root'),
    cssnano({ preset: 'default' })
  ]).process(css, { from: input, to: output });
  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync(output, result.css);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});

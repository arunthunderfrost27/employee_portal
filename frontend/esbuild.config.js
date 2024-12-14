const esbuild = require('esbuild');
const react = require('esbuild-plugin-react');

module.exports = {
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'public/index.js',
  format: 'esm',
  target: 'es2020',
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx'
  },
  plugins: [
    react()
  ]
};
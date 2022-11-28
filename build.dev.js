const { build } = require('esbuild');
const { dependencies } = require('./package.json');
const { exec } = require('child_process');

const sharedConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  external: Object.keys(dependencies),
};

build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outfile: 'dist/index.js',
  define: { 'process.env.PORT': '"8080"' },
  watch: {
    onRebuild(err) {
      if (err) log('error');
      else {
        exec('node dist/index.js');
        console.log('Server started at http://localhost:8080 in "dev" mode');
      }
    },
  },
}).then(() => {
  exec('node dist/index.js');
  console.log('Server started at http://localhost:8080 in "dev" mode');
});

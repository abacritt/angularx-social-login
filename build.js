'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const camelCase = require('camelcase');
const ngc = require('@angular/compiler-cli/src/main').main;
const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify');
const sourcemaps = require('rollup-plugin-sourcemaps');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const inlineResources = require('./inline-resources');

const libName = require('./package.json').name;
const rootFolder = path.join(__dirname);
const compilationFolder = path.join(rootFolder, 'out-tsc');
const srcFolder = path.join(rootFolder, 'src/lib');
const distFolder = path.join(rootFolder, 'dist');
const tempLibFolder = path.join(compilationFolder, 'lib');
const es5OutputFolder = path.join(compilationFolder, 'lib-es5');
const es2015OutputFolder = path.join(compilationFolder, 'lib-es2015');

return Promise.resolve()
  // Copy library to temporary folder and inline html/css.
  .then(() => _relativeCopy(`**/*`, srcFolder, tempLibFolder)
    .then(() => inlineResources(tempLibFolder))
    .then(() => console.log('Inlining succeeded.'))
  )
  // Compile to ES2015.
  .then(() => ngc(['--project', `${tempLibFolder}/tsconfig.lib.json`]), console.error)
    .then(exitCode => exitCode === 0 ? Promise.resolve() : Promise.reject())
    .then(() => console.log('ES2015 compilation succeeded.'))
  
  // Compile to ES5.
  .then(() => ngc(['--project', `${tempLibFolder}/tsconfig.es5.json`]), console.error)
    .then(exitCode => exitCode === 0 ? Promise.resolve() : Promise.reject())
    .then(() => console.log('ES5 compilation succeeded.'))
  
  // Copy typings and metadata to `dist/` folder.
  .then(() => Promise.resolve()
    .then(() => _relativeCopy('**/*.d.ts', es2015OutputFolder, distFolder))
    .then(() => _relativeCopy('**/*.metadata.json', es2015OutputFolder, distFolder))
    .then(() => console.log('Typings and metadata copy succeeded.'))
  )
  // Bundle lib.
  .then(() => {
    // Base configuration.
    const es5Entry = path.join(es5OutputFolder, `${libName}.js`);
    const es2015Entry = path.join(es2015OutputFolder, `${libName}.js`);
    const rollupBaseConfig = {
      input: {
        external: [
          // List of dependencies
          // See https://github.com/rollup/rollup/wiki/JavaScript-API#external for more.
          '@angular/core'
        ],
        plugins: [
          commonjs({}),
          sourcemaps(),
          nodeResolve({ jsnext: true, module: true })
        ]
      },
      output: {
        name: camelCase(libName),
        sourcemap: true,
        globals: {
          // The key here is library name, and the value is the the name of the global variable name
          // the window object.
          // See https://github.com/rollup/rollup/wiki/JavaScript-API#globals for more.
          '@angular/core': 'ng.core'
        }
      }
    };

    // UMD bundle.
    const umdConfig = mergeDeep({}, rollupBaseConfig, {
      input: {
        input: es5Entry
      },
      output: {
        format: 'umd',
        file: path.join(distFolder, `bundles`, `${libName}.umd.js`)
      }
    });

    // Minified UMD bundle.
    const minifiedUmdConfig = mergeDeep({}, rollupBaseConfig, {
      input: {
        input: es5Entry
      },
      output: {
        file: path.join(distFolder, `bundles`, `${libName}.umd.min.js`),
        format: 'umd'
      }
    });

    // ESM+ES5 flat module bundle.
    const fesm5config = mergeDeep({}, rollupBaseConfig, {
      input: {
        input: es5Entry
      },
      output: {
        file: path.join(distFolder, `${libName}.es5.js`),
        format: 'es'
      }
    });

    // ESM+ES2015 flat module bundle.
    const fesm2015config = mergeDeep({}, rollupBaseConfig, {
      input: {
        input: es2015Entry
      },
      output: {
        file: path.join(distFolder, `${libName}.js`),
        format: 'es'
      }
    });

    const allBundles = [
      umdConfig,
      minifiedUmdConfig,
      fesm5config,
      fesm2015config
    ].map(cfg => { 
      rollup.rollup(cfg.input).then(bundle => bundle.write(cfg.output));
    });

    return Promise.all(allBundles)
      .then(() => console.log('All bundles generated successfully.'))
  })
  // Copy package files
  .then(() => Promise.resolve()
    .then(() => _relativeCopy('LICENSE', rootFolder, distFolder))
    .then(() => _relativeCopy('package.json', rootFolder, distFolder))
    .then(() => _relativeCopy('README.md', rootFolder, distFolder))
    .then(() => console.log('Package files copy succeeded.'))
  )
  .catch(e => {
    console.error('\Build failed. See below for errors.\n');
    console.error(e);
    process.exit(1);
  });


// Copy files maintaining relative paths.
function _relativeCopy(fileGlob, from, to) {
  return new Promise((resolve, reject) => {
    glob(fileGlob, { cwd: from, nodir: true }, (err, files) => {
      if (err) reject(err);
      files.forEach(file => {
        const origin = path.join(from, file);
        const dest = path.join(to, file);
        const data = fs.readFileSync(origin, 'utf-8');
        _recursiveMkDir(path.dirname(dest));
        fs.writeFileSync(dest, data);
        resolve();
      })
    })
  });
}

// Recursively create a dir.
function _recursiveMkDir(dir) {
  if (!fs.existsSync(dir)) {
    _recursiveMkDir(path.dirname(dir));
    fs.mkdirSync(dir);
  }
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
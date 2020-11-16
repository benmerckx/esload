# esload

Use webpack loaders as esbuild plugins

```js
import {esload} from 'esload'
import {build} from 'esbuild'

const plugin = esload({
  name: 'my-plugin-name',
  // webpack loaders may emit files to this folder
  outdir: 'dist',
  // use these as you would use webpack module.rules
  rules: [
    {test: /\.txt$/, use: ['raw-loader']},
    {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {modules: {auto: true}}
        },
        'sass-loader'
      ]
    },
    {test: /\.jpg$/, use: ['file-loader']}
    // ...
  ]
})

// build with esbuild
build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist/index.js',
  plugins: [plugin],
  define: {
    // some constants might have to be defined here
    __webpack_public_path__: '"/"'
  }
}).catch(() => process.exit(1))
```

import {esload} from './src/esload'
import {build} from 'esbuild'

const plugin = esload({
  name: 'loaders',
  outdir: 'bin',
  rules: [
    {
      test: /\.scss$/,
      use: [
        'isomorphic-style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              auto: true,
              localIdentName: '[local]-[hash:base64:7]',
              exportLocalsConvention: 'asIs'
            }
          }
        },
        {
          loader: 'sass-loader'
        }
      ]
    },
    {
      test: /\.jpg$/,
      use: [
        {
          loader: 'sizeof-loader',
          options: {
            useFileLoader: true
          }
        }
      ]
    }
  ]
})

build({
  entryPoints: ['test/index.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'bin/test.js',
  plugins: [plugin],
  logLevel: 'info',
  define: {
    __webpack_public_path__: '"/"'
  }
}).catch(() => process.exit(1))

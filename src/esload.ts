import enhancedResolve from 'enhanced-resolve'
import type {Plugin} from 'esbuild'
import {promises as fs, readFile} from 'fs'
import {runLoaders} from 'loader-runner'
import path from 'path'
import type {RuleSetLoader, RuleSetRule} from 'webpack'

type Rule = {
  test: RegExp
  use: Array<string | RuleSetLoader>
}

// Undocumented internal method which for example sass-loader relies on
const getResolve = options => {
  const resolver = enhancedResolve.create(options)
  return (context, request, callback) => {
    if (callback) resolver(context, request, callback)
    else
      return new Promise((resolve, reject) => {
        resolver(context, request, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })
  }
}

/** @see https://webpack.js.org/concepts/loaders/#inline */
enum PathType {
  /** No prefix */
  Normal = '',
  /** Prefixing with ! will disable all configured normal loaders */
  DisableNormal = '!',
  /** Prefixing with !! will disable all configured loaders (preLoaders, loaders, postLoaders) */
  DisableNormalAndPre = '!!',
  /** Prefixing with -! will disable all configured preLoaders and loaders but not postLoaders */
  DisableAll = '-!'
}

const pathType = (path: string) => {
  for (const type of [
    PathType.DisableAll,
    PathType.DisableNormalAndPre,
    PathType.DisableNormal
  ])
    if (path.startsWith(type)) return type
  return PathType.Normal
}

const parsePath = (path: string) => {
  const type = pathType(path)
  switch (type) {
    case PathType.Normal:
      return {type, file: path, loaders: []}
    default:
      const loaders = path.substr(type.length).split('!')
      const file = loaders.pop()
      return {type, file, loaders}
  }
}

export const esload = (options: {
  name: string
  outdir: string
  rules: Array<Rule>
}): Plugin => {
  return {
    name: options.name,
    setup(build) {
      for (const [i, rule] of options.rules.entries()) {
        const namespace = `${options.name}-${i}`
        const loader = rule.use

        build.onResolve({filter: rule.test}, args => {
          const {type, loaders, file} = parsePath(args.path)
          return {
            namespace,
            path:
              type + loaders.concat(path.join(args.resolveDir, file)).join('!')
          }
        })

        build.onResolve({filter: /^[-!|!].*/, namespace}, args => {
          const {file} = parsePath(args.path)
          return {path: path.join(args.resolveDir, file), namespace: 'file'}
        })

        build.onLoad({filter: /.*/, namespace}, args => {
          const {type, loaders, file} = parsePath(args.path)
          let matchingLoaders = type !== PathType.Normal ? loaders : loader
          const dir = path.dirname(file)
          if (matchingLoaders.length === 0)
            return fs
              .readFile(file)
              .then(contents => ({contents, resolveDir: dir}))
          return new Promise((resolve, reject) => {
            runLoaders(
              {
                resource: file,
                loaders: matchingLoaders,
                context: {
                  mode: 'production',
                  rootContext: file,
                  getResolve,
                  async emitFile(
                    name: string,
                    content: string | Buffer,
                    sourceMap: {immutable?: boolean; sourceFileName?: string}
                  ) {
                    await fs.writeFile(path.join(options.outdir, name), content)
                  }
                },
                readResource: readFile
              },
              (error, result) => {
                if (error) {
                  return resolve({
                    errors: [
                      {
                        text: error.message,
                        location: {
                          file: error.path
                        }
                      }
                    ]
                  })
                }
                if (!result.result) return resolve(undefined)
                resolve({contents: result.result[0], resolveDir: dir})
              }
            )
          })
        })
      }
    }
  }
}

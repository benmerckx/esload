import enhancedResolve from 'enhanced-resolve'
import type {Plugin} from 'esbuild'
import fs from 'fs'
import {runLoaders} from 'loader-runner'
import path from 'path'
import type {RuleSetLoader, RuleSetRule} from 'webpack'

const resolver = enhancedResolve.create()

type Rule = {
	test: RegExp
	use: Array<string | RuleSetLoader>
}

const matchRule = (file: string, rules: Array<Rule>) => {
	return rules.find(rule => rule.test.test(file))
}

export const esload = (options: {
	name: string
	outdir: string
	rules: Array<Rule>
}): Plugin => {
	return {
		name: options.name,
		setup(build) {
			build.onResolve({filter: /.*/}, args => {
				if (args.path.startsWith('!'))
					return {path: '!' + args.resolveDir + args.path, namespace: name}
				const file = path.join(args.resolveDir, args.path)
				const rule = matchRule(file, options.rules)
				if (!rule) return
				return {path: file, namespace: name}
			})

			const loaders = new Map<RuleSetRule, Array<string | RuleSetLoader>>()
			for (const rule of options.rules) loaders.set(rule, rule.use)

			build.onLoad({filter: /.*/, namespace: name}, args => {
				let file = args.path,
					matchingLoaders = []
				if (file.startsWith('!')) {
					const parts = file.split('!').filter(v => v)
					file = path.join(parts.shift(), parts.pop())
					matchingLoaders = parts
				} else {
					const rule = matchRule(file, options.rules)
					matchingLoaders = loaders.get(rule)
				}
				const dir = path.dirname(file)
				if (matchingLoaders.length === 0)
					return {contents: fs.readFileSync(file), resolveDir: dir}
				return new Promise((resolve, reject) => {
					runLoaders(
						{
							resource: file,
							loaders: matchingLoaders,
							context: {
								mode: 'production',
								rootContext: file,
								getResolve(options) {
									return (context, request, callback) => {
										if (callback)
											resolver(context, null, request, null, callback)
										else
											return new Promise((resolve, reject) => {
												resolver(
													context,
													null,
													request,
													null,
													(err, result) => {
														if (err) reject(err)
														else resolve(result)
													}
												)
											})
									}
								},
								emitFile(
									name: string,
									content: string | Buffer,
									sourceMap: {immutable?: boolean; sourceFileName?: string}
								) {
									fs.writeFileSync(path.join(options.outdir, name), content)
								}
							},
							readResource: fs.readFile.bind(fs)
						},
						(error, result) => {
							if (error) {
								console.error(error)
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

export default esload

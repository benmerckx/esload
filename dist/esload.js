"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esload = void 0;
var enhanced_resolve_1 = __importDefault(require("enhanced-resolve"));
var fs_1 = __importDefault(require("fs"));
var loader_runner_1 = require("loader-runner");
var path_1 = __importDefault(require("path"));
var resolver = enhanced_resolve_1.default.create();
var matchRule = function (file, rules) {
    return rules.find(function (rule) { return rule.test.test(file); });
};
// Undocumented internal method that sass-loader relies on
var getResolve = function (options) {
    return function (context, request, callback) {
        if (callback)
            resolver(context, null, request, null, callback);
        else
            return new Promise(function (resolve, reject) {
                resolver(context, null, request, null, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            });
    };
};
exports.esload = function (options) {
    return {
        name: options.name,
        setup: function (build) {
            build.onResolve({ filter: /.*/ }, function (args) {
                if (args.path.startsWith('!'))
                    return {
                        path: '!' + args.resolveDir + args.path,
                        namespace: options.name
                    };
                var file = path_1.default.join(args.resolveDir, args.path);
                var rule = matchRule(file, options.rules);
                if (!rule)
                    return;
                return { path: file, namespace: options.name };
            });
            var loaders = new Map();
            for (var _i = 0, _a = options.rules; _i < _a.length; _i++) {
                var rule = _a[_i];
                loaders.set(rule, rule.use);
            }
            build.onLoad({ filter: /.*/, namespace: options.name }, function (args) {
                var file = args.path, matchingLoaders = [];
                if (file.startsWith('!')) {
                    var parts = file.split('!').filter(function (v) { return v; });
                    file = path_1.default.join(parts.shift(), parts.pop());
                    matchingLoaders = parts;
                }
                else {
                    var rule = matchRule(file, options.rules);
                    matchingLoaders = loaders.get(rule);
                }
                var dir = path_1.default.dirname(file);
                if (matchingLoaders.length === 0)
                    return { contents: fs_1.default.readFileSync(file), resolveDir: dir };
                return new Promise(function (resolve, reject) {
                    loader_runner_1.runLoaders({
                        resource: file,
                        loaders: matchingLoaders,
                        context: {
                            mode: 'production',
                            rootContext: file,
                            getResolve: getResolve,
                            emitFile: function (name, content, sourceMap) {
                                fs_1.default.writeFileSync(path_1.default.join(options.outdir, name), content);
                            }
                        },
                        readResource: fs_1.default.readFile.bind(fs_1.default)
                    }, function (error, result) {
                        if (error) {
                            console.error(error);
                            return resolve({
                                errors: [
                                    {
                                        text: error.message,
                                        location: {
                                            file: error.path
                                        }
                                    }
                                ]
                            });
                        }
                        if (!result.result)
                            return resolve(undefined);
                        resolve({ contents: result.result[0], resolveDir: dir });
                    });
                });
            });
        }
    };
};
exports.default = exports.esload;
//# sourceMappingURL=esload.js.map
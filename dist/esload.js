"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esload = void 0;
var enhanced_resolve_1 = __importDefault(require("enhanced-resolve"));
var fs_1 = require("fs");
var loader_runner_1 = require("loader-runner");
var path_1 = __importDefault(require("path"));
// Undocumented internal method which for example sass-loader relies on
var getResolve = function (options) {
    var resolver = enhanced_resolve_1.default.create(options);
    return function (context, request, callback) {
        if (callback)
            resolver(context, request, callback);
        else
            return new Promise(function (resolve, reject) {
                resolver(context, request, function (err, result) {
                    if (err)
                        reject(err);
                    else
                        resolve(result);
                });
            });
    };
};
/** @see https://webpack.js.org/concepts/loaders/#inline */
var PathType;
(function (PathType) {
    /** No prefix */
    PathType["Normal"] = "";
    /** Prefixing with ! will disable all configured normal loaders */
    PathType["DisableNormal"] = "!";
    /** Prefixing with !! will disable all configured loaders (preLoaders, loaders, postLoaders) */
    PathType["DisableNormalAndPre"] = "!!";
    /** Prefixing with -! will disable all configured preLoaders and loaders but not postLoaders */
    PathType["DisableAll"] = "-!";
})(PathType || (PathType = {}));
var pathType = function (path) {
    var e_1, _a;
    try {
        for (var _b = __values([
            PathType.DisableAll,
            PathType.DisableNormalAndPre,
            PathType.DisableNormal
        ]), _c = _b.next(); !_c.done; _c = _b.next()) {
            var type = _c.value;
            if (path.startsWith(type))
                return type;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return PathType.Normal;
};
var parsePath = function (path) {
    var type = pathType(path);
    switch (type) {
        case PathType.Normal:
            return { type: type, file: path, loaders: [] };
        default:
            var loaders = path.substr(type.length).split('!');
            var file = loaders.pop();
            return {
                type: type,
                file: file,
                loaders: loaders
            };
    }
};
exports.esload = function (options) {
    return {
        name: options.name,
        setup: function (build) {
            var e_2, _a;
            var _loop_1 = function (i, rule) {
                var namespace = options.name + "-" + i;
                var loader = rule.use;
                build.onResolve({ filter: rule.test }, function (args) {
                    var _a = parsePath(args.path), type = _a.type, loaders = _a.loaders, file = _a.file;
                    return {
                        namespace: namespace,
                        path: type + loaders.concat(path_1.default.join(args.resolveDir, file)).join('!')
                    };
                });
                build.onResolve({ filter: /^[-!|!].*/, namespace: namespace }, function (args) {
                    var file = parsePath(args.path).file;
                    return { path: path_1.default.join(args.resolveDir, file), namespace: 'file' };
                });
                build.onLoad({ filter: /.*/, namespace: namespace }, function (args) {
                    var _a = parsePath(args.path), type = _a.type, loaders = _a.loaders, file = _a.file;
                    var matchingLoaders = type !== PathType.Normal ? loaders : loader;
                    var dir = path_1.default.dirname(file);
                    if (matchingLoaders.length === 0)
                        return fs_1.promises
                            .readFile(file)
                            .then(function (contents) { return ({ contents: contents, resolveDir: dir }); });
                    return new Promise(function (resolve, reject) {
                        loader_runner_1.runLoaders({
                            resource: file,
                            loaders: matchingLoaders,
                            context: {
                                mode: 'production',
                                rootContext: file,
                                getResolve: getResolve,
                                emitFile: function (name, content, sourceMap) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, fs_1.promises.writeFile(path_1.default.join(options.outdir, name), content)];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                }
                            },
                            readResource: fs_1.readFile
                        }, function (error, result) {
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
                                });
                            }
                            if (!result.result)
                                return resolve(undefined);
                            resolve({ contents: result.result[0], resolveDir: dir });
                        });
                    });
                });
            };
            try {
                for (var _b = __values(options.rules.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), i = _d[0], rule = _d[1];
                    _loop_1(i, rule);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    };
};
//# sourceMappingURL=esload.js.map
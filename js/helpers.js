! function (f) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = f();
    else if ("function" == typeof define && define.amd) define([], f);
    else {
        var g;
        g = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, g.helpers = f()
    }
}(function () {
    var define;
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = "function" == typeof require && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        for (var i = "function" == typeof require && require, o = 0; o < r.length; o++) s(r[o]);
        return s
    }({
        1: [function (require, module) {
            "use strict";
            module.exports = function () {
                try {
                    return !!new Blob
                } catch (e) {
                    return !1
                }
            }()
        }, {}],
        2: [function (require, module) {
            "use strict";

            function Emitter() {
                EventEmitter.call(this), this.setMaxListeners(20)
            }
            var EventEmitter = require("events").EventEmitter;
            Emitter.prototype = Object.create(EventEmitter.prototype), Emitter.prototype.constructor = Emitter, Emitter.prototype.off = function (type, listener) {
                return listener ? this.removeListener(type, listener) : type ? this.removeAllListeners(type) : this.removeAllListeners()
            }, module.exports = Emitter
        }, {
            events: 7
        }],
        3: [function (require, module) {
            "use strict";
            var Emitter = require("./emitter.js"),
                createLoader = require("./loader"),
                autoId = 0;
            module.exports = function createGroup(config) {
                var group, map = {},
                    assets = [],
                    queue = [],
                    numLoaded = 0,
                    numTotal = 0,
                    loaders = {},
                    add = function (options) {
                        if (Array.isArray(options)) return options.forEach(add), group;
                        var loader, isGroup = !!options.assets && Array.isArray(options.assets);
                        return loader = isGroup ? createGroup(configure(options, config)) : createLoader(configure(options, config)), loader.once("destroy", destroyHandler), queue.push(loader), loaders[loader.id] = loader, group
                    },
                    get = function (id) {
                        return arguments.length ? map[id] : assets
                    },
                    find = function (id) {
                        if (get(id)) return get(id);
                        var found = null;
                        return Object.keys(loaders).some(function (key) {
                            return found = loaders[key].find && loaders[key].find(id), !!found
                        }), found
                    },
                    getExtension = function (url) {
                        return url && url.split("?")[0].split(".").pop().toLowerCase()
                    },
                    configure = function (options, defaults) {
                        if ("string" == typeof options) {
                            var url = options;
                            options = {
                                url: url
                            }
                        }
                        return void 0 === options.isTouchLocked && (options.isTouchLocked = defaults.isTouchLocked), void 0 === options.blob && (options.blob = defaults.blob), void 0 === options.basePath && (options.basePath = defaults.basePath), options.id = options.id || options.url || String(++autoId), options.type = options.type || getExtension(options.url), options.crossOrigin = options.crossOrigin || defaults.crossOrigin, options.webAudioContext = options.webAudioContext || defaults.webAudioContext, options.log = defaults.log, options
                    },
                    start = function () {
                        return numTotal = queue.length, queue.forEach(function (loader) {
                            loader.on("progress", progressHandler).once("complete", completeHandler).once("error", errorHandler).start()
                        }), queue = [], group
                    },
                    progressHandler = function (progress) {
                        var loaded = numLoaded + progress;
                        group.emit("progress", loaded / numTotal)
                    },
                    completeHandler = function (asset, id, type) {
                        Array.isArray(asset) && (asset = {
                            id: id,
                            file: asset,
                            type: type
                        }), numLoaded++, group.emit("progress", numLoaded / numTotal), map[asset.id] = asset.file, assets.push(asset), group.emit("childcomplete", asset), checkComplete()
                    },
                    errorHandler = function (err) {
                        numTotal--, group.listeners("error").length ? group.emit("error", err) : console.error(err), checkComplete()
                    },
                    destroyHandler = function (id) {
                        loaders[id] = null, delete loaders[id], map[id] = null, delete map[id], assets.some(function (asset, i) {
                            return asset.id === id ? (assets.splice(i, 1), !0) : void 0
                        })
                    },
                    checkComplete = function () {
                        numLoaded >= numTotal && group.emit("complete", assets, config.id, "group")
                    },
                    destroy = function () {
                        for (; queue.length;) queue.pop().destroy();
                        return group.off("error"), group.off("progress"), group.off("complete"), assets = [], map = {}, config.webAudioContext = null, numTotal = 0, numLoaded = 0, Object.keys(loaders).forEach(function (key) {
                            loaders[key].destroy()
                        }), loaders = {}, group.emit("destroy", group.id), group
                    };
                return group = Object.create(Emitter.prototype, {
                    _events: {
                        value: {}
                    },
                    id: {
                        get: function () {
                            return config.id
                        }
                    },
                    add: {
                        value: add
                    },
                    start: {
                        value: start
                    },
                    get: {
                        value: get
                    },
                    find: {
                        value: find
                    },
                    getLoader: {
                        value: function (id) {
                            return loaders[id]
                        }
                    },
                    loaded: {
                        get: function () {
                            return numLoaded >= numTotal
                        }
                    },
                    file: {
                        get: function () {
                            return assets
                        }
                    },
                    destroy: {
                        value: destroy
                    }
                }), config = configure(config || {}, {
                    basePath: "",
                    blob: !1,
                    touchLocked: !1,
                    crossOrigin: null,
                    webAudioContext: null,
                    log: !1
                }), Array.isArray(config.assets) && add(config.assets), Object.freeze(group)
            }
        }, {
            "./emitter.js": 2,
            "./loader": 5
        }],
        4: [function (require, module) {
            "use strict";
            var assetsLoader = require("./group");
            assetsLoader.stats = require("./stats"), module.exports = assetsLoader
        }, {
            "./group": 3,
            "./stats": 6
        }],
        5: [function (require, module) {
            "use strict";
            var Emitter = require("./emitter.js"),
                browserHasBlob = require("./browser-has-blob.js"),
                stats = require("./stats");
            module.exports = function (options) {
                var loader, loadHandler, request, startTime, timeout, file, id = options.id,
                    basePath = options.basePath || "",
                    url = options.url,
                    type = options.type,
                    crossOrigin = options.crossOrigin,
                    isTouchLocked = options.isTouchLocked,
                    blob = options.blob && browserHasBlob,
                    webAudioContext = options.webAudioContext,
                    log = options.log,
                    start = function () {
                        switch (startTime = Date.now(), type) {
                            case "json":
                                loadJSON();
                                break;
                            case "jpg":
                            case "png":
                            case "gif":
                            case "webp":
                                loadImage();
                                break;
                            case "mp3":
                            case "ogg":
                            case "opus":
                            case "wav":
                            case "m4a":
                                loadAudio();
                                break;
                            case "ogv":
                            case "mp4":
                            case "webm":
                            case "hls":
                                loadVideo();
                                break;
                            case "bin":
                            case "binary":
                                loadXHR("arraybuffer");
                                break;
                            case "txt":
                            case "text":
                                loadXHR("text");
                                break;
                            default:
                                throw "AssetsLoader ERROR: Unknown type for file with URL: " + basePath + url + " (" + type + ")"
                        }
                    },
                    dispatchComplete = function (data) {
                        data && (file = {
                            id: id,
                            file: data,
                            type: type
                        }, loader.emit("progress", 1), loader.emit("complete", file, id, type), removeListeners())
                    },
                    loadXHR = function (responseType, customLoadHandler) {
                        loadHandler = customLoadHandler || completeHandler, request = new XMLHttpRequest, request.open("GET", basePath + url, !0), request.responseType = responseType, request.addEventListener("progress", progressHandler), request.addEventListener("load", loadHandler), request.addEventListener("error", errorHandler), request.send()
                    },
                    progressHandler = function (event) {
                        event.lengthComputable && loader.emit("progress", event.loaded / event.total)
                    },
                    completeHandler = function () {
                        success() && dispatchComplete(request.response)
                    },
                    success = function () {
                        return request && request.status < 400 ? (stats.update(request, startTime, url, log), !0) : (errorHandler(request && request.statusText), !1)
                    },
                    loadJSON = function () {
                        loadXHR("json", function () {
                            if (success()) {
                                var data = request.response;
                                "string" == typeof data && (data = JSON.parse(data)), dispatchComplete(data)
                            }
                        })
                    },
                    loadImage = function () {
                        blob ? loadImageBlob() : loadImageElement()
                    },
                    loadImageElement = function () {
                        request = new Image, crossOrigin && (request.crossOrigin = "anonymous"), request.addEventListener("error", errorHandler, !1), request.addEventListener("load", elementLoadHandler, !1), request.src = basePath + url
                    },
                    elementLoadHandler = function () {
                        window.clearTimeout(timeout), dispatchComplete(request)
                    },
                    loadImageBlob = function () {
                        loadXHR("blob", function () {
                            success() && (request = new Image, request.addEventListener("error", errorHandler, !1), request.addEventListener("load", imageBlobHandler, !1), request.src = window.URL.createObjectURL(request.response))
                        })
                    },
                    imageBlobHandler = function () {
                        window.URL.revokeObjectURL(request.src), dispatchComplete(request)
                    },
                    loadAudio = function () {
                        webAudioContext ? loadAudioBuffer() : loadMediaElement("audio")
                    },
                    loadVideo = function () {
                        blob ? loadXHR("blob") : loadMediaElement("video")
                    },
                    loadAudioBuffer = function () {
                        loadXHR("arraybuffer", function () {
                            success() && webAudioContext.decodeAudioData(request.response, function (buffer) {
                                request = null, dispatchComplete(buffer)
                            }, function (e) {
                                errorHandler(e)
                            })
                        })
                    },
                    loadMediaElement = function (tagName) {
                        request = document.createElement(tagName), isTouchLocked || (window.clearTimeout(timeout), timeout = window.setTimeout(elementLoadHandler, 2e3), request.addEventListener("canplaythrough", elementLoadHandler, !1)), request.addEventListener("error", errorHandler, !1), request.preload = "auto", request.src = basePath + url, request.load(), isTouchLocked && dispatchComplete(request)
                    },
                    errorHandler = function (err) {
                        window.clearTimeout(timeout);
                        var message = err;
                        if (request && request.tagName && request.error) {
                            var ERROR_STATE = ["", "ABORTED", "NETWORK", "DECODE", "SRC_NOT_SUPPORTED"];
                            message = "MediaError: " + ERROR_STATE[request.error.code] + " " + request.src
                        } else request && request.statusText ? message = request.statusText : err && err.message ? message = err.message : err && err.type && (message = err.type);
                        loader.emit("error", 'Error loading "' + basePath + url + '" ' + message), destroy()
                    },
                    removeListeners = function () {
                        loader.off("error"), loader.off("progress"), loader.off("complete"), request && (request.removeEventListener("progress", progressHandler), request.removeEventListener("load", loadHandler), request.removeEventListener("error", errorHandler), request.removeEventListener("load", elementLoadHandler), request.removeEventListener("canplaythrough", elementLoadHandler), request.removeEventListener("load", imageBlobHandler))
                    },
                    destroy = function () {
                        removeListeners(), request && request.abort && request.readyState < 4 && request.abort(), request = null, webAudioContext = null, file = null, window.clearTimeout(timeout), loader.emit("destroy", id)
                    };
                return loader = Object.create(Emitter.prototype, {
                    _events: {
                        value: {}
                    },
                    id: {
                        value: options.id
                    },
                    start: {
                        value: start
                    },
                    loaded: {
                        get: function () {
                            return !!file
                        }
                    },
                    file: {
                        get: function () {
                            return file
                        }
                    },
                    destroy: {
                        value: destroy
                    }
                }), Object.freeze(loader)
            }
        }, {
            "./browser-has-blob.js": 1,
            "./emitter.js": 2,
            "./stats": 6
        }],
        6: [function (require, module) {
            "use strict";
            module.exports = {
                mbs: 0,
                secs: 0,
                update: function (request, startTime, url, log) {
                    var length, headers = request.getAllResponseHeaders();
                    if (headers) {
                        var match = headers.match(/content-length: (\d+)/i);
                        match && match.length && (length = match[1])
                    }
                    if (length) {
                        length = parseInt(length, 10);
                        var mbs = length / 1024 / 1024,
                            secs = (Date.now() - startTime) / 1e3;
                        this.secs += secs, this.mbs += mbs, log && this.log(url, mbs, secs)
                    } else log && console.warn.call(console, "Can't get Content-Length:", url)
                },
                log: function (url, mbs, secs) {
                    if (url) {
                        var file = "File loaded: " + url.substr(url.lastIndexOf("/") + 1) + " size:" + mbs.toFixed(2) + "mb time:" + secs.toFixed(2) + "s speed:" + (mbs / secs).toFixed(2) + "mbps";
                        console.log.call(console, file)
                    }
                    var total = "Total loaded: " + this.mbs.toFixed(2) + "mb time:" + this.secs.toFixed(2) + "s speed:" + this.getMbps().toFixed(2) + "mbps";
                    console.log.call(console, total)
                },
                getMbps: function () {
                    return this.mbs / this.secs
                }
            }
        }, {}],
        7: [function (require, module) {
            function EventEmitter() {
                this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
            }

            function isFunction(arg) {
                return "function" == typeof arg
            }

            function isNumber(arg) {
                return "number" == typeof arg
            }

            function isObject(arg) {
                return "object" == typeof arg && null !== arg
            }

            function isUndefined(arg) {
                return void 0 === arg
            }
            module.exports = EventEmitter, EventEmitter.EventEmitter = EventEmitter, EventEmitter.prototype._events = void 0, EventEmitter.prototype._maxListeners = void 0, EventEmitter.defaultMaxListeners = 10, EventEmitter.prototype.setMaxListeners = function (n) {
                if (!isNumber(n) || 0 > n || isNaN(n)) throw TypeError("n must be a positive number");
                return this._maxListeners = n, this
            }, EventEmitter.prototype.emit = function (type) {
                var er, handler, len, args, i, listeners;
                if (this._events || (this._events = {}), "error" === type && (!this._events.error || isObject(this._events.error) && !this._events.error.length)) {
                    if (er = arguments[1], er instanceof Error) throw er;
                    var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
                    throw err.context = er, err
                }
                if (handler = this._events[type], isUndefined(handler)) return !1;
                if (isFunction(handler)) switch (arguments.length) {
                    case 1:
                        handler.call(this);
                        break;
                    case 2:
                        handler.call(this, arguments[1]);
                        break;
                    case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;
                    default:
                        args = Array.prototype.slice.call(arguments, 1), handler.apply(this, args)
                } else if (isObject(handler))
                    for (args = Array.prototype.slice.call(arguments, 1), listeners = handler.slice(), len = listeners.length, i = 0; len > i; i++) listeners[i].apply(this, args);
                return !0
            }, EventEmitter.prototype.addListener = function (type, listener) {
                var m;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener), this._events[type] ? isObject(this._events[type]) ? this._events[type].push(listener) : this._events[type] = [this._events[type], listener] : this._events[type] = listener, isObject(this._events[type]) && !this._events[type].warned && (m = isUndefined(this._maxListeners) ? EventEmitter.defaultMaxListeners : this._maxListeners, m && m > 0 && this._events[type].length > m && (this._events[type].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[type].length), "function" == typeof console.trace && console.trace())), this
            }, EventEmitter.prototype.on = EventEmitter.prototype.addListener, EventEmitter.prototype.once = function (type, listener) {
                function g() {
                    this.removeListener(type, g), fired || (fired = !0, listener.apply(this, arguments))
                }
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                var fired = !1;
                return g.listener = listener, this.on(type, g), this
            }, EventEmitter.prototype.removeListener = function (type, listener) {
                var list, position, length, i;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[type]) return this;
                if (list = this._events[type], length = list.length, position = -1, list === listener || isFunction(list.listener) && list.listener === listener) delete this._events[type], this._events.removeListener && this.emit("removeListener", type, listener);
                else if (isObject(list)) {
                    for (i = length; i-- > 0;)
                        if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                            position = i;
                            break
                        }
                    if (0 > position) return this;
                    1 === list.length ? (list.length = 0, delete this._events[type]) : list.splice(position, 1), this._events.removeListener && this.emit("removeListener", type, listener)
                }
                return this
            }, EventEmitter.prototype.removeAllListeners = function (type) {
                var key, listeners;
                if (!this._events) return this;
                if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[type] && delete this._events[type], this;
                if (0 === arguments.length) {
                    for (key in this._events) "removeListener" !== key && this.removeAllListeners(key);
                    return this.removeAllListeners("removeListener"), this._events = {}, this
                }
                if (listeners = this._events[type], isFunction(listeners)) this.removeListener(type, listeners);
                else if (listeners)
                    for (; listeners.length;) this.removeListener(type, listeners[listeners.length - 1]);
                return delete this._events[type], this
            }, EventEmitter.prototype.listeners = function (type) {
                var ret;
                return ret = this._events && this._events[type] ? isFunction(this._events[type]) ? [this._events[type]] : this._events[type].slice() : []
            }, EventEmitter.prototype.listenerCount = function (type) {
                if (this._events) {
                    var evlistener = this._events[type];
                    if (isFunction(evlistener)) return 1;
                    if (evlistener) return evlistener.length
                }
                return 0
            }, EventEmitter.listenerCount = function (emitter, type) {
                return emitter.listenerCount(type)
            }
        }, {}],
        8: [function (require, module) {
            ! function (undef) {
                function MinSignal() {
                    this._listeners = [], this.dispatchCount = 0
                }

                function _sort(list) {
                    list.sort(function (a, b) {
                        return a = a.p, b = b.p, a > b ? 1 : a > b ? -1 : 0
                    })
                }

                function add(fn, context, priority, args) {
                    if (!fn) throw ERROR_MESSAGE_MISSING_CALLBACK;
                    priority = priority || 0;
                    for (var listener, realFn, sliceIndex, listeners = this._listeners, i = listeners.length; i--;)
                        if (listener = listeners[i], listener.f === fn && listener.c === context) return !1;
                    "function" == typeof priority && (realFn = priority, priority = args, sliceIndex = 4), listeners.unshift({
                        f: fn,
                        c: context,
                        p: priority,
                        r: realFn || fn,
                        a: _slice.call(arguments, sliceIndex || 3),
                        j: 0
                    }), _sort(listeners)
                }

                function addOnce(fn, context, priority, args) {
                    if (!fn) throw ERROR_MESSAGE_MISSING_CALLBACK;
                    var self = this,
                        realFn = function () {
                            return self.remove.call(self, fn, context), fn.apply(context, _slice.call(arguments, 0))
                        };
                    args = _slice.call(arguments, 0), 1 === args.length && args.push(undef), args.splice(2, 0, realFn), add.apply(self, args)
                }

                function remove(fn, context) {
                    if (!fn) return this._listeners.length = 0, !0;
                    for (var listener, listeners = this._listeners, i = listeners.length; i--;)
                        if (listener = listeners[i], listener.f === fn && (!context || listener.c === context)) return listener.j = 0, listeners.splice(i, 1), !0;
                    return !1
                }

                function dispatch(args) {
                    args = _slice.call(arguments, 0), this.dispatchCount++;
                    for (var listener, stoppedListener, dispatchCount = this.dispatchCount, listeners = this._listeners, i = listeners.length; i--;)
                        if (listener = listeners[i], listener && listener.j < dispatchCount && (listener.j = dispatchCount, listener.r.apply(listener.c, listener.a.concat(args)) === !1)) {
                            stoppedListener = listener;
                            break
                        }
                    for (listeners = this._listeners, i = listeners.length; i--;) listeners[i].j = 0;
                    return stoppedListener
                }
                var _p = MinSignal.prototype;
                _p.add = add, _p.addOnce = addOnce, _p.remove = remove, _p.dispatch = dispatch;
                var ERROR_MESSAGE_MISSING_CALLBACK = "Callback function is missing!",
                    _slice = Array.prototype.slice;
                "undefined" != typeof module && (module.exports = MinSignal)
            }()
        }, {}],
        9: [function (require, module, exports) {
            ! function (root, factory) {
                "object" == typeof exports && "object" == typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define("oui", [], factory) : "object" == typeof exports ? exports.oui = factory() : root.oui = factory()
            }(this, function () {
                return function (modules) {
                    function __webpack_require__(moduleId) {
                        if (installedModules[moduleId]) return installedModules[moduleId].exports;
                        var module = installedModules[moduleId] = {
                            exports: {},
                            id: moduleId,
                            loaded: !1
                        };
                        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), module.loaded = !0, module.exports
                    }
                    var installedModules = {};
                    return __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.p = "", __webpack_require__(0)
                }([function (module, exports, __webpack_require__) {
                    (function (process) {
                        "use strict";
                        var oui = function () {};
                        "production" !== process.env.NODE_ENV && (oui = __webpack_require__(100)["default"]), oui.version = "0.0.20", module.exports = oui
                    }).call(exports, __webpack_require__(72))
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    exports.__esModule = !0;
                    var _assign = __webpack_require__(105),
                        _assign2 = _interopRequireDefault(_assign);
                    exports["default"] = _assign2["default"] || function (target) {
                        for (var i = 1; i < arguments.length; i++) {
                            var source = arguments[i];
                            for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key])
                        }
                        return target
                    }
                }, function (module, exports, __webpack_require__) {
                    (function () {
                        ! function (global, factory) {
                            module.exports = factory()
                        }(this, function () {
                            "use strict";

                            function VNode(nodeName, attributes, children) {
                                this.nodeName = nodeName, this.attributes = attributes, this.children = children
                            }

                            function extend(obj, props) {
                                for (var i in props) hasOwnProperty.call(props, i) && (obj[i] = props[i]);
                                return obj
                            }

                            function clone(obj) {
                                var out = {};
                                for (var i in obj) out[i] = obj[i];
                                return out
                            }

                            function memoize(fn, mem) {
                                return mem = mem || {},
                                    function (k) {
                                        return hasOwnProperty.call(mem, k) ? mem[k] : mem[k] = fn(k)
                                    }
                            }

                            function delve(obj, key) {
                                for (var p = key.split("."), i = 0; i < p.length && obj; i++) obj = obj[p[i]];
                                return obj
                            }

                            function toArray(obj) {
                                for (var arr = [], i = obj.length; i--;) arr[i] = obj[i];
                                return arr
                            }

                            function styleObjToCss(s) {
                                var str = "";
                                for (var prop in s) {
                                    var val = s[prop];
                                    empty(val) || (str && (str += " "), str += jsToCss(prop), str += ": ", str += val, "number" != typeof val || NON_DIMENSION_PROPS[prop] || (str += "px"), str += ";")
                                }
                                return str
                            }

                            function hashToClassName(c) {
                                var str = "";
                                for (var prop in c) c[prop] && (str && (str += " "), str += prop);
                                return str
                            }

                            function normalize(obj, prop, fn) {
                                var v = obj[prop];
                                v && !isString(v) && (obj[prop] = fn(v))
                            }

                            function optionsHook(name, a, b) {
                                return hook(options, name, a, b)
                            }

                            function hook(obj, name, a, b, c) {
                                return obj[name] ? obj[name](a, b, c) : void 0
                            }

                            function deepHook(obj, type) {
                                do hook(obj, type); while (obj = obj._component)
                            }

                            function h(nodeName, attributes) {
                                var len = arguments.length,
                                    attributeChildren = attributes && attributes.children,
                                    children = void 0,
                                    arr = void 0,
                                    lastSimple = void 0;
                                if (attributeChildren && (delete attributes.children, 3 > len)) return h(nodeName, attributes, attributeChildren);
                                for (var i = 2; len > i; i++) {
                                    var _p = arguments[i];
                                    if (!falsey(_p)) {
                                        children || (children = []), _p.join ? arr = _p : (arr = SHARED_TEMP_ARRAY, arr[0] = _p);
                                        for (var j = 0; j < arr.length; j++) {
                                            var child = arr[j],
                                                simple = !(falsey(child) || child instanceof VNode);
                                            simple && (child = String(child)), simple && lastSimple ? children[children.length - 1] += child : falsey(child) || children.push(child), lastSimple = simple
                                        }
                                    }
                                }
                                var p = new VNode(nodeName, attributes || void 0, children || void 0);
                                return optionsHook("vnode", p), p
                            }

                            function createLinkedState(component, key, eventPath) {
                                var path = key.split("."),
                                    p0 = path[0],
                                    len = path.length;
                                return function (e) {
                                    var _component$setState, t = this,
                                        s = component.state,
                                        obj = s,
                                        v = void 0,
                                        i = void 0;
                                    if (isString(eventPath) ? (v = delve(e, eventPath), empty(v) && (t = t._component) && (v = delve(t, eventPath))) : v = (t.nodeName + t.type).match(/^input(check|rad)/i) ? t.checked : t.value, isFunction(v) && (v = v.call(t)), len > 1) {
                                        for (i = 0; len - 1 > i; i++) obj = obj[path[i]] || (obj[path[i]] = {});
                                        obj[path[i]] = v, v = s[p0]
                                    }
                                    component.setState((_component$setState = {}, _component$setState[p0] = v, _component$setState))
                                }
                            }

                            function enqueueRender(component) {
                                1 === items.push(component) && (options.debounceRendering || setImmediate)(rerender)
                            }

                            function rerender() {
                                if (items.length) {
                                    var currentItems = items,
                                        p = void 0;
                                    for (items = itemsOffline, itemsOffline = currentItems; p = currentItems.pop();) p._dirty && renderComponent(p)
                                }
                            }

                            function isFunctionalComponent(_ref) {
                                var nodeName = _ref.nodeName;
                                return isFunction(nodeName) && !(nodeName.prototype && nodeName.prototype.render)
                            }

                            function buildFunctionalComponent(vnode, context) {
                                return vnode.nodeName(getNodeProps(vnode), context || EMPTY) || EMPTY_BASE
                            }

                            function ensureNodeData(node) {
                                return node[ATTR_KEY] || (node[ATTR_KEY] = {})
                            }

                            function getNodeType(node) {
                                return node.nodeType
                            }

                            function appendChildren(parent, children) {
                                for (var len = children.length, many = len > 2, into = many ? document.createDocumentFragment() : parent, i = 0; len > i; i++) into.appendChild(children[i]);
                                many && parent.appendChild(into)
                            }

                            function removeNode(node) {
                                var p = node.parentNode;
                                p && p.removeChild(node)
                            }

                            function getAccessor(node, name, value, cache) {
                                if ("type" !== name && "style" !== name && name in node) return node[name];
                                var attrs = node[ATTR_KEY];
                                return cache !== !1 && attrs && hasOwnProperty.call(attrs, name) ? attrs[name] : "class" === name ? node.className : "style" === name ? node.style.cssText : value
                            }

                            function setAccessor(node, name, value) {
                                "class" === name ? node.className = value || "" : "style" === name ? node.style.cssText = value || "" : "dangerouslySetInnerHTML" === name ? value && value.__html && (node.innerHTML = value.__html) : "key" === name || name in node && "type" !== name ? (node[name] = value, falsey(value) && node.removeAttribute(name)) : setComplexAccessor(node, name, value), ensureNodeData(node)[name] = value
                            }

                            function setComplexAccessor(node, name, value) {
                                if ("on" !== name.substring(0, 2)) {
                                    var type = typeof value;
                                    falsey(value) ? node.removeAttribute(name) : "function" !== type && "object" !== type && node.setAttribute(name, value)
                                } else {
                                    var _type = normalizeEventName(name),
                                        l = node._listeners || (node._listeners = {}),
                                        fn = l[_type] ? value ? null : "remove" : "add";
                                    fn && node[fn + "EventListener"](_type, eventProxy), l[_type] = value
                                }
                            }

                            function eventProxy(e) {
                                var fn = this._listeners[normalizeEventName(e.type)];
                                return fn ? fn.call(this, optionsHook("event", e) || e) : void 0
                            }

                            function getNodeAttributes(node) {
                                return node[ATTR_KEY] || getRawNodeAttributes(node) || EMPTY
                            }

                            function getRawNodeAttributes(node) {
                                var list = node.attributes;
                                return list && list.getNamedItem ? getAttributesAsObject(list) : list
                            }

                            function getAttributesAsObject(list) {
                                for (var attrs = void 0, i = list.length; i--;) {
                                    var item = list[i];
                                    attrs || (attrs = {}), attrs[item.name] = item.value
                                }
                                return attrs
                            }

                            function isSameNodeType(node, vnode) {
                                if (isFunctionalComponent(vnode)) return !0;
                                var nodeName = vnode.nodeName;
                                return isFunction(nodeName) ? node._componentConstructor === nodeName : 3 === getNodeType(node) ? isString(vnode) : toLowerCase(node.nodeName) === nodeName
                            }

                            function getNodeProps(vnode) {
                                var props = clone(vnode.attributes),
                                    c = vnode.children;
                                c && (props.children = c);
                                var defaultProps = vnode.nodeName.defaultProps;
                                if (defaultProps)
                                    for (var i in defaultProps) !hasOwnProperty.call(defaultProps, i) || i in props || (props[i] = defaultProps[i]);
                                return props
                            }

                            function collectNode(node) {
                                cleanNode(node);
                                var name = normalizeName(node.nodeName),
                                    list = nodes[name];
                                list ? list.push(node) : nodes[name] = [node]
                            }

                            function createNode(nodeName) {
                                var name = normalizeName(nodeName),
                                    list = nodes[name],
                                    node = list && list.pop() || document.createElement(nodeName);
                                return ensureNodeData(node), node
                            }

                            function cleanNode(node) {
                                removeNode(node), 3 !== getNodeType(node) && (node[ATTR_KEY] || (node[ATTR_KEY] = getRawNodeAttributes(node)), node._component = node._componentConstructor = null)
                            }

                            function diff(dom, vnode, context) {
                                for (var originalAttributes = vnode.attributes; isFunctionalComponent(vnode);) vnode = buildFunctionalComponent(vnode, context);
                                if (isFunction(vnode.nodeName)) return buildComponentFromVNode(dom, vnode, context);
                                if (isString(vnode)) {
                                    if (dom) {
                                        var type = getNodeType(dom);
                                        if (3 === type) return dom[TEXT_CONTENT] = vnode, dom;
                                        1 === type && collectNode(dom)
                                    }
                                    return document.createTextNode(vnode)
                                }
                                var out = dom,
                                    nodeName = vnode.nodeName || UNDEFINED_ELEMENT;
                                return dom ? toLowerCase(dom.nodeName) !== nodeName && (out = createNode(nodeName), appendChildren(out, toArray(dom.childNodes)), recollectNodeTree(dom)) : out = createNode(nodeName), innerDiffNode(out, vnode, context), diffAttributes(out, vnode), originalAttributes && originalAttributes.ref && (out[ATTR_KEY].ref = originalAttributes.ref)(out), out
                            }

                            function innerDiffNode(dom, vnode, context) {
                                var children = void 0,
                                    keyed = void 0,
                                    keyedLen = 0,
                                    len = dom.childNodes.length,
                                    childrenLen = 0;
                                if (len) {
                                    children = [];
                                    for (var i = 0; len > i; i++) {
                                        var child = dom.childNodes[i],
                                            key = child._component ? child._component.__key : getAccessor(child, "key");
                                        empty(key) ? children[childrenLen++] = child : (keyed || (keyed = {}), keyed[key] = child, keyedLen++)
                                    }
                                }
                                var vchildren = vnode.children,
                                    vlen = vchildren && vchildren.length,
                                    min = 0;
                                if (vlen)
                                    for (var i = 0; vlen > i; i++) {
                                        var vchild = vchildren[i],
                                            child = void 0;
                                        if (keyedLen) {
                                            var attrs = vchild.attributes,
                                                key = attrs && attrs.key;
                                            !empty(key) && hasOwnProperty.call(keyed, key) && (child = keyed[key], keyed[key] = null, keyedLen--)
                                        }
                                        if (!child && childrenLen > min)
                                            for (var j = min; childrenLen > j; j++) {
                                                var c = children[j];
                                                if (c && isSameNodeType(c, vchild)) {
                                                    child = c, children[j] = null, j === childrenLen - 1 && childrenLen--, j === min && min++;
                                                    break
                                                }
                                            }
                                        if (child = diff(child, vchild, context), dom.childNodes[i] !== child) {
                                            var c = child.parentNode !== dom && child._component,
                                                next = dom.childNodes[i + 1];
                                            c && deepHook(c, "componentWillMount"), next ? dom.insertBefore(child, next) : dom.appendChild(child), c && deepHook(c, "componentDidMount")
                                        }
                                    }
                                if (keyedLen)
                                    for (var i in keyed) hasOwnProperty.call(keyed, i) && keyed[i] && (children[min = childrenLen++] = keyed[i]);
                                childrenLen > min && removeOrphanedChildren(children)
                            }

                            function removeOrphanedChildren(children, unmountOnly) {
                                for (var i = children.length; i--;) {
                                    var child = children[i];
                                    child && recollectNodeTree(child, unmountOnly)
                                }
                            }

                            function recollectNodeTree(node, unmountOnly) {
                                var attrs = node[ATTR_KEY];
                                attrs && hook(attrs, "ref", null);
                                var component = node._component;
                                if (component) unmountComponent(component, !unmountOnly);
                                else {
                                    if (!unmountOnly) {
                                        if (1 !== getNodeType(node)) return void removeNode(node);
                                        collectNode(node)
                                    }
                                    var c = node.childNodes;
                                    c && c.length && removeOrphanedChildren(c, unmountOnly)
                                }
                            }

                            function diffAttributes(dom, vnode) {
                                var old = getNodeAttributes(dom) || EMPTY,
                                    attrs = vnode.attributes || EMPTY,
                                    name = void 0,
                                    value = void 0;
                                for (name in old) empty(attrs[name]) && setAccessor(dom, name, null);
                                if (attrs !== EMPTY)
                                    for (name in attrs) hasOwnProperty.call(attrs, name) && (value = attrs[name], empty(value) || value == getAccessor(dom, name) || setAccessor(dom, name, value))
                            }

                            function collectComponent(component) {
                                var name = component.constructor.name,
                                    list = components[name];
                                list ? list.push(component) : components[name] = [component]
                            }

                            function createComponent(Ctor, props, context) {
                                for (var list = components[Ctor.name], len = list && list.length, c = void 0, i = 0; len > i; i++)
                                    if (c = list[i], c.constructor === Ctor) {
                                        list.splice(i, 1);
                                        var inst = new Ctor(props, context);
                                        return inst.nextBase = c.base, inst
                                    }
                                return new Ctor(props, context)
                            }

                            function triggerComponentRender(component) {
                                component._dirty || (component._dirty = !0, enqueueRender(component))
                            }

                            function setComponentProps(component, props, opts, context) {
                                var d = component._disableRendering;
                                component.__ref = props.ref, component.__key = props.key, delete props.ref, delete props.key, component._disableRendering = !0, context && (component.prevContext || (component.prevContext = component.context), component.context = context), component.base && hook(component, "componentWillReceiveProps", props, component.context), component.prevProps || (component.prevProps = component.props), component.props = props, component._disableRendering = d, opts && opts.render === !1 || (opts && opts.renderSync || options.syncComponentUpdates !== !1 ? renderComponent(component) : triggerComponentRender(component)), hook(component, "__ref", component)
                            }

                            function renderComponent(component, opts) {
                                if (!component._disableRendering) {
                                    var skip = void 0,
                                        rendered = void 0,
                                        props = component.props,
                                        state = component.state,
                                        context = component.context,
                                        previousProps = component.prevProps || props,
                                        previousState = component.prevState || state,
                                        previousContext = component.prevContext || context,
                                        isUpdate = component.base,
                                        initialBase = isUpdate || component.nextBase;
                                    if (isUpdate && (component.props = previousProps, component.state = previousState, component.context = previousContext, hook(component, "shouldComponentUpdate", props, state, context) === !1 ? skip = !0 : hook(component, "componentWillUpdate", props, state, context), component.props = props, component.state = state, component.context = context), component.prevProps = component.prevState = component.prevContext = component.nextBase = null, component._dirty = !1, !skip) {
                                        rendered = hook(component, "render", props, state, context);
                                        var childComponent = rendered && rendered.nodeName,
                                            childContext = component.getChildContext ? component.getChildContext() : context,
                                            toUnmount = void 0,
                                            base = void 0;
                                        if (isFunction(childComponent) && childComponent.prototype.render) {
                                            var inst = component._component;
                                            inst && inst.constructor !== childComponent && (toUnmount = inst, inst = null);
                                            var childProps = getNodeProps(rendered);
                                            inst ? setComponentProps(inst, childProps, SYNC_RENDER, childContext) : (inst = createComponent(childComponent, childProps, childContext), inst._parentComponent = component, component._component = inst, isUpdate && deepHook(inst, "componentWillMount"), setComponentProps(inst, childProps, NO_RENDER, childContext), renderComponent(inst, DOM_RENDER), isUpdate && deepHook(inst, "componentDidMount")), base = inst.base
                                        } else {
                                            var cbase = initialBase;
                                            toUnmount = component._component, toUnmount && (cbase = component._component = null), (initialBase || opts && opts.build) && (base = diff(cbase, rendered || EMPTY_BASE, childContext))
                                        }
                                        if (initialBase && base !== initialBase) {
                                            var p = initialBase.parentNode;
                                            p && base !== p && p.replaceChild(base, initialBase)
                                        }
                                        if (toUnmount && unmountComponent(toUnmount, !0), component.base = base, base) {
                                            for (var componentRef = component, t = component; t = t._parentComponent;) componentRef = t;
                                            base._component = componentRef, base._componentConstructor = componentRef.constructor
                                        }
                                        isUpdate && hook(component, "componentDidUpdate", previousProps, previousState, previousContext)
                                    }
                                    var cb = component._renderCallbacks,
                                        fn = void 0;
                                    if (cb)
                                        for (; fn = cb.pop();) fn.call(component);
                                    return rendered
                                }
                            }

                            function buildComponentFromVNode(dom, vnode, context) {
                                for (var c = dom && dom._component, oldDom = dom, isOwner = c && dom._componentConstructor === vnode.nodeName; c && !isOwner && (c = c._parentComponent);) isOwner = c.constructor === vnode.nodeName;
                                return isOwner ? (setComponentProps(c, getNodeProps(vnode), SYNC_RENDER, context), dom = c.base) : (c && (unmountComponent(c, !0), dom = oldDom = null), dom = createComponentFromVNode(vnode, dom, context), oldDom && dom !== oldDom && (oldDom._component = null, recollectNodeTree(oldDom))), dom
                            }

                            function createComponentFromVNode(vnode, dom, context) {
                                var props = getNodeProps(vnode),
                                    component = createComponent(vnode.nodeName, props, context);
                                return dom && !component.base && (component.base = dom), setComponentProps(component, props, NO_RENDER, context), renderComponent(component, DOM_RENDER), component.base
                            }

                            function unmountComponent(component, remove) {
                                hook(component, "__ref", null), hook(component, "componentWillUnmount");
                                var inner = component._component;
                                inner && (unmountComponent(inner, remove), remove = !1);
                                var base = component.base;
                                base && (remove !== !1 && removeNode(base), removeOrphanedChildren(base.childNodes, !0)), remove && (component._parentComponent = null, collectComponent(component)), hook(component, "componentDidUnmount")
                            }

                            function Component(props, context) {
                                this._dirty = this._disableRendering = !1, this.prevState = this.prevProps = this.prevContext = this.base = this.nextBase = this._parentComponent = this._component = this.__ref = this.__key = this._linkedStates = this._renderCallbacks = null, this.context = context || {}, this.props = props, this.state = hook(this, "getInitialState") || {}
                            }

                            function render(vnode, parent, merge) {
                                var existing = merge && merge._component && merge._componentConstructor === vnode.nodeName,
                                    built = diff(merge, vnode),
                                    c = !existing && built._component;
                                return c && deepHook(c, "componentWillMount"), built.parentNode !== parent && parent.appendChild(built), c && deepHook(c, "componentDidMount"), built
                            }
                            var NO_RENDER = {
                                    render: !1
                                },
                                SYNC_RENDER = {
                                    renderSync: !0
                                },
                                DOM_RENDER = {
                                    build: !0
                                },
                                EMPTY = {},
                                EMPTY_BASE = "",
                                HAS_DOM = "undefined" != typeof document,
                                TEXT_CONTENT = !HAS_DOM || "textContent" in document ? "textContent" : "nodeValue",
                                ATTR_KEY = "undefined" != typeof Symbol ? Symbol["for"]("preactattr") : "__preactattr_",
                                UNDEFINED_ELEMENT = "undefined",
                                NON_DIMENSION_PROPS = {
                                    boxFlex: 1,
                                    boxFlexGroup: 1,
                                    columnCount: 1,
                                    fillOpacity: 1,
                                    flex: 1,
                                    flexGrow: 1,
                                    flexPositive: 1,
                                    flexShrink: 1,
                                    flexNegative: 1,
                                    fontWeight: 1,
                                    lineClamp: 1,
                                    lineHeight: 1,
                                    opacity: 1,
                                    order: 1,
                                    orphans: 1,
                                    strokeOpacity: 1,
                                    widows: 1,
                                    zIndex: 1,
                                    zoom: 1
                                },
                                isFunction = function (obj) {
                                    return "function" == typeof obj
                                },
                                isString = function (obj) {
                                    return "string" == typeof obj
                                },
                                hasOwnProperty = {}.hasOwnProperty,
                                empty = function (x) {
                                    return null == x
                                },
                                falsey = function (value) {
                                    return value === !1 || null == value
                                },
                                jsToCss = memoize(function (s) {
                                    return s.replace(/([A-Z])/g, "-$1").toLowerCase()
                                }),
                                toLowerCase = memoize(function (s) {
                                    return s.toLowerCase()
                                }),
                                ch = void 0;
                            try {
                                ch = new MessageChannel
                            } catch (e) {}
                            var setImmediate = ch ? function (f) {
                                    ch.port1.onmessage = f, ch.port2.postMessage("")
                                } : setTimeout,
                                options = {
                                    vnode: function (n) {
                                        var attrs = n.attributes;
                                        if (attrs && !isFunction(n.nodeName)) {
                                            var p = attrs.className;
                                            p && (attrs["class"] = p, delete attrs.className), attrs["class"] && normalize(attrs, "class", hashToClassName), attrs.style && normalize(attrs, "style", styleObjToCss)
                                        }
                                    }
                                },
                                SHARED_TEMP_ARRAY = [],
                                items = [],
                                itemsOffline = [],
                                normalizeEventName = memoize(function (t) {
                                    return t.replace(/^on/i, "").toLowerCase()
                                }),
                                nodes = {},
                                normalizeName = memoize(function (name) {
                                    return name.toUpperCase()
                                }),
                                components = {};
                            extend(Component.prototype, {
                                linkState: function (key, eventPath) {
                                    var c = this._linkedStates || (this._linkedStates = {}),
                                        cacheKey = key + "|" + (eventPath || "");
                                    return c[cacheKey] || (c[cacheKey] = createLinkedState(this, key, eventPath))
                                },
                                setState: function (state, callback) {
                                    var s = this.state;
                                    this.prevState || (this.prevState = clone(s)), extend(s, isFunction(state) ? state(s, this.props) : state), callback && (this._renderCallbacks = this._renderCallbacks || []).push(callback), triggerComponentRender(this)
                                },
                                forceUpdate: function () {
                                    renderComponent(this)
                                },
                                render: function () {
                                    return null
                                }
                            });
                            var preact = {
                                h: h,
                                Component: Component,
                                render: render,
                                rerender: rerender,
                                options: options,
                                hooks: options
                            };
                            return preact
                        })
                    }).call(exports, __webpack_require__(51).setImmediate)
                }, function (module, exports) {
                    "use strict";
                    exports.__esModule = !0, exports["default"] = function (instance, Constructor) {
                        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    exports.__esModule = !0;
                    var _defineProperty = __webpack_require__(60),
                        _defineProperty2 = _interopRequireDefault(_defineProperty);
                    exports["default"] = function () {
                        function defineProperties(target, props) {
                            for (var i = 0; i < props.length; i++) {
                                var descriptor = props[i];
                                descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), _defineProperty2["default"](target, descriptor.key, descriptor)
                            }
                        }
                        return function (Constructor, protoProps, staticProps) {
                            return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                        }
                    }()
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    exports.__esModule = !0;
                    var _setPrototypeOf = __webpack_require__(107),
                        _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf),
                        _create = __webpack_require__(106),
                        _create2 = _interopRequireDefault(_create),
                        _typeof2 = __webpack_require__(18),
                        _typeof3 = _interopRequireDefault(_typeof2);
                    exports["default"] = function (subClass, superClass) {
                        if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + ("undefined" == typeof superClass ? "undefined" : _typeof3["default"](superClass)));
                        subClass.prototype = _create2["default"](superClass && superClass.prototype, {
                            constructor: {
                                value: subClass,
                                enumerable: !1,
                                writable: !0,
                                configurable: !0
                            }
                        }), superClass && (_setPrototypeOf2["default"] ? _setPrototypeOf2["default"](subClass, superClass) : subClass.__proto__ = superClass)
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    exports.__esModule = !0;
                    var _typeof2 = __webpack_require__(18),
                        _typeof3 = _interopRequireDefault(_typeof2);
                    exports["default"] = function (self, call) {
                        if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return !call || "object" !== ("undefined" == typeof call ? "undefined" : _typeof3["default"](call)) && "function" != typeof call ? self : call
                    }
                }, function (module, exports) {
                    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
                    ! function (global, factory) {
                        __WEBPACK_AMD_DEFINE_ARRAY__ = [exports, module], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof __WEBPACK_AMD_DEFINE_FACTORY__ ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, !(void 0 !== __WEBPACK_AMD_DEFINE_RESULT__ && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
                    }(this, function (exports, module) {
                        "use strict";

                        function getIteratorFn(maybeIterable) {
                            var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
                            return "function" == typeof iteratorFn ? iteratorFn : void 0
                        }

                        function createChainableTypeChecker(validate) {
                            function checkType(isRequired, props, propName, componentName, location, propFullName) {
                                if (componentName = componentName || ANONYMOUS, propFullName = propFullName || propName, null == props[propName]) {
                                    var locationName = ReactPropTypeLocationNames[location];
                                    return isRequired ? new Error("Required " + locationName + " `" + propFullName + "` was not specified in " + ("`" + componentName + "`.")) : null
                                }
                                return validate(props, propName, componentName, location, propFullName)
                            }
                            var chainedCheckType = checkType.bind(null, !1);
                            return chainedCheckType.isRequired = checkType.bind(null, !0), chainedCheckType
                        }

                        function createPrimitiveTypeChecker(expectedType) {
                            function validate(props, propName, componentName, location, propFullName) {
                                var propValue = props[propName],
                                    propType = getPropType(propValue);
                                if (propType !== expectedType) {
                                    var locationName = ReactPropTypeLocationNames[location],
                                        preciseType = getPreciseType(propValue);
                                    return new Error("Invalid " + locationName + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."))
                                }
                                return null
                            }
                            return createChainableTypeChecker(validate)
                        }

                        function createAnyTypeChecker() {
                            return createChainableTypeChecker(emptyFunction.thatReturns(null))
                        }

                        function createArrayOfTypeChecker(typeChecker) {
                            function validate(props, propName, componentName, location, propFullName) {
                                var propValue = props[propName];
                                if (!Array.isArray(propValue)) {
                                    var locationName = ReactPropTypeLocationNames[location],
                                        propType = getPropType(propValue);
                                    return new Error("Invalid " + locationName + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."))
                                }
                                for (var i = 0; i < propValue.length; i++) {
                                    var error = typeChecker(propValue, i, componentName, location, propFullName + "[" + i + "]");
                                    if (error instanceof Error) return error
                                }
                                return null
                            }
                            return createChainableTypeChecker(validate)
                        }

                        function createElementTypeChecker() {
                            function validate(props, propName, componentName, location, propFullName) {
                                if (!ReactElement.isValidElement(props[propName])) {
                                    var locationName = ReactPropTypeLocationNames[location];
                                    return new Error("Invalid " + locationName + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a single ReactElement."))
                                }
                                return null
                            }
                            return createChainableTypeChecker(validate)
                        }

                        function createInstanceTypeChecker(expectedClass) {
                            function validate(props, propName, componentName, location, propFullName) {
                                if (!(props[propName] instanceof expectedClass)) {
                                    var locationName = ReactPropTypeLocationNames[location],
                                        expectedClassName = expectedClass.name || ANONYMOUS,
                                        actualClassName = getClassName(props[propName]);
                                    return new Error("Invalid " + locationName + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."))
                                }
                                return null
                            }
                            return createChainableTypeChecker(validate)
                        }

                        function createEnumTypeChecker(expectedValues) {
                            function validate(props, propName, componentName, location, propFullName) {
                                for (var propValue = props[propName], i = 0; i < expectedValues.length; i++)
                                    if (propValue === expectedValues[i]) return null;
                                var locationName = ReactPropTypeLocationNames[location],
                                    valuesString = JSON.stringify(expectedValues);
                                return new Error("Invalid " + locationName + " `" + propFullName + "` of value `" + propValue + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."))
                            }
                            return createChainableTypeChecker(Array.isArray(expectedValues) ? validate : function () {
                                return new Error("Invalid argument supplied to oneOf, expected an instance of array.")
                            })
                        }

                        function createObjectOfTypeChecker(typeChecker) {
                            function validate(props, propName, componentName, location, propFullName) {
                                var propValue = props[propName],
                                    propType = getPropType(propValue);
                                if ("object" !== propType) {
                                    var locationName = ReactPropTypeLocationNames[location];
                                    return new Error("Invalid " + locationName + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."))
                                }
                                for (var key in propValue)
                                    if (propValue.hasOwnProperty(key)) {
                                        var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key);
                                        if (error instanceof Error) return error
                                    }
                                return null
                            }
                            return createChainableTypeChecker(validate)
                        }

                        function createUnionTypeChecker(arrayOfTypeCheckers) {
                            function validate(props, propName, componentName, location, propFullName) {
                                for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
                                    var checker = arrayOfTypeCheckers[i];
                                    if (null == checker(props, propName, componentName, location, propFullName)) return null
                                }
                                var locationName = ReactPropTypeLocationNames[location];
                                return new Error("Invalid " + locationName + " `" + propFullName + "` supplied to " + ("`" + componentName + "`."))
                            }
                            return createChainableTypeChecker(Array.isArray(arrayOfTypeCheckers) ? validate : function () {
                                return new Error("Invalid argument supplied to oneOfType, expected an instance of array.")
                            })
                        }

                        function createNodeChecker() {
                            function validate(props, propName, componentName, location, propFullName) {
                                if (!isNode(props[propName])) {
                                    var locationName = ReactPropTypeLocationNames[location];
                                    return new Error("Invalid " + locationName + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."))
                                }
                                return null
                            }
                            return createChainableTypeChecker(validate)
                        }

                        function createShapeTypeChecker(shapeTypes) {
                            function validate(props, propName, componentName, location, propFullName) {
                                var propValue = props[propName],
                                    propType = getPropType(propValue);
                                if ("object" !== propType) {
                                    var locationName = ReactPropTypeLocationNames[location];
                                    return new Error("Invalid " + locationName + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."))
                                }
                                for (var key in shapeTypes) {
                                    var checker = shapeTypes[key];
                                    if (checker) {
                                        var error = checker(propValue, key, componentName, location, propFullName + "." + key);
                                        if (error) return error
                                    }
                                }
                                return null
                            }
                            return createChainableTypeChecker(validate)
                        }

                        function isNode(propValue) {
                            switch (typeof propValue) {
                                case "number":
                                case "string":
                                case "undefined":
                                    return !0;
                                case "boolean":
                                    return !propValue;
                                case "object":
                                    if (Array.isArray(propValue)) return propValue.every(isNode);
                                    if (null === propValue || ReactElement.isValidElement(propValue)) return !0;
                                    var iteratorFn = getIteratorFn(propValue);
                                    if (!iteratorFn) return !1;
                                    var step, iterator = iteratorFn.call(propValue);
                                    if (iteratorFn !== propValue.entries) {
                                        for (; !(step = iterator.next()).done;)
                                            if (!isNode(step.value)) return !1
                                    } else
                                        for (; !(step = iterator.next()).done;) {
                                            var entry = step.value;
                                            if (entry && !isNode(entry[1])) return !1
                                        }
                                    return !0;
                                default:
                                    return !1
                            }
                        }

                        function getPropType(propValue) {
                            var propType = typeof propValue;
                            return Array.isArray(propValue) ? "array" : propValue instanceof RegExp ? "object" : propType
                        }

                        function getPreciseType(propValue) {
                            var propType = getPropType(propValue);
                            if ("object" === propType) {
                                if (propValue instanceof Date) return "date";
                                if (propValue instanceof RegExp) return "regexp"
                            }
                            return propType
                        }

                        function getClassName(propValue) {
                            return propValue.constructor && propValue.constructor.name ? propValue.constructor.name : ANONYMOUS
                        }
                        var REACT_ELEMENT_TYPE = "function" == typeof Symbol && Symbol["for"] && Symbol["for"]("react.element") || 60103,
                            ReactElement = {};
                        ReactElement.isValidElement = function (object) {
                            return "object" == typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE
                        };
                        var ReactPropTypeLocationNames = {
                                prop: "prop",
                                context: "context",
                                childContext: "child context"
                            },
                            emptyFunction = {
                                thatReturns: function (what) {
                                    return function () {
                                        return what
                                    }
                                }
                            },
                            ITERATOR_SYMBOL = "function" == typeof Symbol && Symbol.iterator,
                            FAUX_ITERATOR_SYMBOL = "@@iterator",
                            ANONYMOUS = "<<anonymous>>",
                            ReactPropTypes = {
                                array: createPrimitiveTypeChecker("array"),
                                bool: createPrimitiveTypeChecker("boolean"),
                                func: createPrimitiveTypeChecker("function"),
                                number: createPrimitiveTypeChecker("number"),
                                object: createPrimitiveTypeChecker("object"),
                                string: createPrimitiveTypeChecker("string"),
                                any: createAnyTypeChecker(),
                                arrayOf: createArrayOfTypeChecker,
                                element: createElementTypeChecker(),
                                instanceOf: createInstanceTypeChecker,
                                node: createNodeChecker(),
                                objectOf: createObjectOfTypeChecker,
                                oneOf: createEnumTypeChecker,
                                oneOfType: createUnionTypeChecker,
                                shape: createShapeTypeChecker
                            };
                        module.exports = ReactPropTypes
                    })
                }, function (module, exports) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.base = {
                        fontFamily: "Menlo, Inconcolata, Consolas",
                        marginTop: "2px",
                        marginBottom: "2px",
                        fontSize: 10,
                        boxSizing: "border-box",
                        color: "rgb(66,66,66)"
                    }, exports.secondary = {
                        color: "rgb(210,210,210)"
                    }, exports.highlight = {
                        color: "rgb(255,82,82)"
                    }
                }, function (module, exports, __webpack_require__) {
                    var store = __webpack_require__(45)("wks"),
                        uid = __webpack_require__(32),
                        Symbol = __webpack_require__(12).Symbol,
                        USE_SYMBOL = "function" == typeof Symbol,
                        $exports = module.exports = function (name) {
                            return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)("Symbol." + name))
                        };
                    $exports.store = store
                }, function (module) {
                    var core = module.exports = {
                        version: "2.4.0"
                    };
                    "number" == typeof __e && (__e = core)
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.hasAnnotation = exports.getAnnotation = exports.setAnnotation = exports.annotate = void 0, __webpack_require__(153); {
                        var DUI_KEY = Symbol("Oui, Oui"),
                            getAnnotation = (exports.annotate = function (value) {
                                return function (obj, prop) {
                                    return Reflect.defineMetadata(DUI_KEY, value, obj, prop)
                                }
                            }, exports.setAnnotation = function (obj, prop, value) {
                                return Reflect.defineMetadata(DUI_KEY, value, obj, prop)
                            }, exports.getAnnotation = function (obj, prop) {
                                return Reflect.getMetadata(DUI_KEY, obj, prop)
                            });
                        exports.hasAnnotation = function (obj, prop) {
                            return null !== getAnnotation(obj, prop)
                        }
                    }
                }, function (module) {
                    var global = module.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
                    "number" == typeof __g && (__g = global)
                }, function (module, exports, __webpack_require__) {
                    var anObject = __webpack_require__(19),
                        IE8_DOM_DEFINE = __webpack_require__(63),
                        toPrimitive = __webpack_require__(48),
                        dP = Object.defineProperty;
                    exports.f = __webpack_require__(14) ? Object.defineProperty : function (O, P, Attributes) {
                        if (anObject(O), P = toPrimitive(P, !0), anObject(Attributes), IE8_DOM_DEFINE) try {
                            return dP(O, P, Attributes)
                        } catch (e) {}
                        if ("get" in Attributes || "set" in Attributes) throw TypeError("Accessors not supported!");
                        return "value" in Attributes && (O[P] = Attributes.value), O
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = !__webpack_require__(23)(function () {
                        return 7 != Object.defineProperty({}, "a", {
                            get: function () {
                                return 7
                            }
                        }).a
                    })
                }, function (module, exports, __webpack_require__) {
                    var global = __webpack_require__(12),
                        core = __webpack_require__(10),
                        ctx = __webpack_require__(37),
                        hide = __webpack_require__(20),
                        PROTOTYPE = "prototype",
                        $export = function (type, name, source) {
                            var key, own, out, IS_FORCED = type & $export.F,
                                IS_GLOBAL = type & $export.G,
                                IS_STATIC = type & $export.S,
                                IS_PROTO = type & $export.P,
                                IS_BIND = type & $export.B,
                                IS_WRAP = type & $export.W,
                                exports = IS_GLOBAL ? core : core[name] || (core[name] = {}),
                                expProto = exports[PROTOTYPE],
                                target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
                            IS_GLOBAL && (source = name);
                            for (key in source) own = !IS_FORCED && target && void 0 !== target[key], own && key in exports || (out = own ? target[key] : source[key], exports[key] = IS_GLOBAL && "function" != typeof target[key] ? source[key] : IS_BIND && own ? ctx(out, global) : IS_WRAP && target[key] == out ? function (C) {
                                var F = function (a, b, c) {
                                    if (this instanceof C) {
                                        switch (arguments.length) {
                                            case 0:
                                                return new C;
                                            case 1:
                                                return new C(a);
                                            case 2:
                                                return new C(a, b)
                                        }
                                        return new C(a, b, c)
                                    }
                                    return C.apply(this, arguments)
                                };
                                return F[PROTOTYPE] = C[PROTOTYPE], F
                            }(out) : IS_PROTO && "function" == typeof out ? ctx(Function.call, out) : out, IS_PROTO && ((exports.virtual || (exports.virtual = {}))[key] = out, type & $export.R && expProto && !expProto[key] && hide(expProto, key, out)))
                        };
                    $export.F = 1, $export.G = 2, $export.S = 4, $export.P = 8, $export.B = 16, $export.W = 32, $export.U = 64, $export.R = 128, module.exports = $export
                }, function (module) {
                    var hasOwnProperty = {}.hasOwnProperty;
                    module.exports = function (it, key) {
                        return hasOwnProperty.call(it, key)
                    }
                }, function (module, exports, __webpack_require__) {
                    var IObject = __webpack_require__(64),
                        defined = __webpack_require__(38);
                    module.exports = function (it) {
                        return IObject(defined(it))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    exports.__esModule = !0;
                    var _iterator = __webpack_require__(109),
                        _iterator2 = _interopRequireDefault(_iterator),
                        _symbol = __webpack_require__(108),
                        _symbol2 = _interopRequireDefault(_symbol),
                        _typeof = "function" == typeof _symbol2["default"] && "symbol" == typeof _iterator2["default"] ? function (obj) {
                            return typeof obj
                        } : function (obj) {
                            return obj && "function" == typeof _symbol2["default"] && obj.constructor === _symbol2["default"] ? "symbol" : typeof obj
                        };
                    exports["default"] = "function" == typeof _symbol2["default"] && "symbol" === _typeof(_iterator2["default"]) ? function (obj) {
                        return "undefined" == typeof obj ? "undefined" : _typeof(obj)
                    } : function (obj) {
                        return obj && "function" == typeof _symbol2["default"] && obj.constructor === _symbol2["default"] ? "symbol" : "undefined" == typeof obj ? "undefined" : _typeof(obj)
                    }
                }, function (module, exports, __webpack_require__) {
                    var isObject = __webpack_require__(24);
                    module.exports = function (it) {
                        if (!isObject(it)) throw TypeError(it + " is not an object!");
                        return it
                    }
                }, function (module, exports, __webpack_require__) {
                    var dP = __webpack_require__(13),
                        createDesc = __webpack_require__(27);
                    module.exports = __webpack_require__(14) ? function (object, key, value) {
                        return dP.f(object, key, createDesc(1, value))
                    } : function (object, key, value) {
                        return object[key] = value, object
                    }
                }, function (module, exports, __webpack_require__) {
                    ! function (global, factory) {
                        module.exports = factory(__webpack_require__(2))
                    }(this, function (preact) {
                        "use strict";

                        function overwriteProperty(el, key) {
                            var err = PROPERTY_ERRORS[key];
                            err === !1 ? Object.defineProperty(el, key, contentPropertyDef(key)) : attemptOverwriteProperty(el, key)
                        }

                        function attemptOverwriteProperty(el, key) {
                            try {
                                Object.defineProperty(el, key, contentPropertyDef(key)), PROPERTY_ERRORS[key] = !1
                            } catch (e) {
                                if (!PROPERTY_ERRORS[key]) {
                                    var err = el.nodeName + ": " + e;
                                    PROPERTY_ERRORS[key] = err, !hasPropertyErrors && "undefined" != typeof console && console.warn && (hasPropertyErrors = !0, console.warn("Error overwriting some SVG properties.", {
                                        errors: PROPERTY_ERRORS
                                    }))
                                }
                            }
                        }

                        function setStateUpdateProxy(component) {
                            return function () {
                                component.componentDidUpdate(), component = null
                            }
                        }
                        var babelHelpers = {};
                        babelHelpers.classCallCheck = function (instance, Constructor) {
                            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
                        }, babelHelpers["extends"] = Object.assign || function (target) {
                            for (var i = 1; i < arguments.length; i++) {
                                var source = arguments[i];
                                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key])
                            }
                            return target
                        }, babelHelpers.inherits = function (subClass, superClass) {
                            if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                            subClass.prototype = Object.create(superClass && superClass.prototype, {
                                constructor: {
                                    value: subClass,
                                    enumerable: !1,
                                    writable: !0,
                                    configurable: !0
                                }
                            }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
                        }, babelHelpers.objectWithoutProperties = function (obj, keys) {
                            var target = {};
                            for (var i in obj) keys.indexOf(i) >= 0 || Object.prototype.hasOwnProperty.call(obj, i) && (target[i] = obj[i]);
                            return target
                        }, babelHelpers.possibleConstructorReturn = function (self, call) {
                            if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                            return !call || "object" != typeof call && "function" != typeof call ? self : call
                        };
                        var DOM = "undefined" != typeof document && !!document.createElement,
                            SVG_ATTRS = ["viewBox"],
                            NS = {
                                xlink: "http://www.w3.org/1999/xlink"
                            },
                            NS_ATTR = /^([a-zA-Z]+)(?:\:|([A-Z]))/,
                            PROP_TO_ATTR_MAP = {
                                className: "class"
                            },
                            EMPTY = {},
                            updateMode = !1;
                        DOM && ! function () {
                            var div = document.createElement("div"),
                                oldCreate = document.createElement;
                            document.createElement = function (name) {
                                if (updateMode || "svg" === name) {
                                    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
                                    el.setAttribute = createAttributeShim("setAttribute"), el.getAttribute = createAttributeShim("getAttribute"), el.removeAttribute = createAttributeShim("removeAttribute");
                                    for (var key in el) !~SVG_ATTRS.indexOf(key) && key in div && !PROP_TO_ATTR_MAP.hasOwnProperty(key) || overwriteProperty(el, key);
                                    return el
                                }
                                return oldCreate.call(document, name)
                            }
                        }();
                        var PROPERTY_ERRORS = {},
                            hasPropertyErrors = !1,
                            memoize = function (fn) {
                                var mem = arguments.length <= 1 || void 0 === arguments[1] ? {} : arguments[1];
                                return function (k) {
                                    return mem.hasOwnProperty(k) ? mem[k] : mem[k] = fn(k)
                                }
                            },
                            contentPropertyDef = memoize(function (prop) {
                                var attr = arguments.length <= 1 || void 0 === arguments[1] ? PROP_TO_ATTR_MAP[prop] || prop : arguments[1];
                                return {
                                    set: function (v) {
                                        null === v || void 0 === v ? this.removeAttribute(attr) : this.setAttribute(attr, v)
                                    },
                                    get: function () {
                                        return this.getAttribute(attr)
                                    }
                                }
                            }),
                            createAttributeShim = memoize(function (method) {
                                return function (name, value) {
                                    var proto = this.constructor.prototype,
                                        p = name.match(NS_ATTR);
                                    if (p && NS.hasOwnProperty(p[1])) {
                                        name = name.replace(NS_ATTR, "$2").toLowerCase();
                                        var ns = NS[p[1]];
                                        return proto[method + "NS"].call(this, ns, name, value)
                                    }
                                    return proto[method].call(this, name, value)
                                }
                            }),
                            SVG = function (_Component) {
                                function SVG() {
                                    return babelHelpers.classCallCheck(this, SVG), babelHelpers.possibleConstructorReturn(this, _Component.apply(this, arguments))
                                }
                                return babelHelpers.inherits(SVG, _Component), SVG.prototype.componentWillUpdate = function () {
                                    updateMode = !0
                                }, SVG.prototype.componentDidUpdate = function () {
                                    updateMode = !1
                                }, SVG.prototype.render = function (_ref) {
                                    var children = _ref.children,
                                        props = babelHelpers.objectWithoutProperties(_ref, ["children"]);
                                    return this.hasRendered || (this.hasRendered = updateMode = !0, this.setState(EMPTY, setStateUpdateProxy(this))), preact.h("svg", babelHelpers["extends"]({
                                        version: "1.1",
                                        xmlns: "http://www.w3.org/2000/svg"
                                    }, props), children)
                                }, SVG
                            }(preact.Component);
                        return SVG
                    })
                }, function (module, exports) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.PI2 = 2 * Math.PI, exports.HALF_PI = .5 * Math.PI, exports.DEG2RAD = Math.PI / 180, exports.RAD2DEG = 180 / Math.PI, exports.EPS = 1e-5, exports.mix = function (n, a, b) {
                        return a * (1 - n) + b * n
                    }, exports.map = function (n, a, b, x, y) {
                        return x + (n - a) * (y - x) / (b - a)
                    }, exports.clamp = function (n, a, b) {
                        return a > n ? a : n > b ? b : n
                    }, exports.random = function (a, b) {
                        return void 0 === b ? Math.random() * a : Math.random() * (b - a) + a
                    }
                }, function (module) {
                    module.exports = function (exec) {
                        try {
                            return !!exec()
                        } catch (e) {
                            return !0
                        }
                    }
                }, function (module) {
                    module.exports = function (it) {
                        return "object" == typeof it ? null !== it : "function" == typeof it
                    }
                }, function (module) {
                    module.exports = {}
                }, function (module, exports, __webpack_require__) {
                    var $keys = __webpack_require__(68),
                        enumBugKeys = __webpack_require__(39);
                    module.exports = Object.keys || function (O) {
                        return $keys(O, enumBugKeys)
                    }
                }, function (module) {
                    module.exports = function (bitmap, value) {
                        return {
                            enumerable: !(1 & bitmap),
                            configurable: !(2 & bitmap),
                            writable: !(4 & bitmap),
                            value: value
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _defineProperty2 = __webpack_require__(61),
                        _defineProperty3 = _interopRequireDefault(_defineProperty2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes);
                    exports["default"] = function (Comp) {
                        var WrappedComponent = function (_Comp) {
                            function WrappedComponent() {
                                _classCallCheck3["default"](this, WrappedComponent);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(WrappedComponent).call(this));
                                return _this.onChildChange = function (change) {
                                    return _this.props.onChange(_defineProperty3["default"]({}, _this.props.id, change))
                                }, _this
                            }
                            return _inherits3["default"](WrappedComponent, _Comp), _createClass3["default"](WrappedComponent, [{
                                key: "render",
                                value: function () {
                                    return _preact2["default"].h(Comp, _extends3["default"]({}, this.props, {
                                        "class": "oui-control",
                                        onChange: this.onChildChange
                                    }))
                                }
                            }]), WrappedComponent
                        }(Comp);
                        return WrappedComponent.propTypes = {
                            onChange: _proptypes2["default"].func.isRequired,
                            id: _proptypes2["default"].string.isRequired,
                            value: Comp.propTypes.value
                        }, WrappedComponent
                    }
                }, function (module, exports) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports["default"] = function (condition, message) {
                        condition && "undefined" != typeof console && console.warn("Warning: " + message)
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function Colr() {
                        return this instanceof Colr == !1 ? new Colr : void(this._ = {})
                    }

                    function clampPercentage(val) {
                        return Math.max(Math.min(val, 100), 0)
                    }

                    function clampByte(byte) {
                        return Math.max(Math.min(byte, 255), 0)
                    }

                    function clampRgb(r, g, b) {
                        return [Math.max(Math.min(r, 255), 0), Math.max(Math.min(g, 255), 0), Math.max(Math.min(b, 255), 0)]
                    }

                    function clampHsx(h, s, x) {
                        return [Math.max(Math.min(h, 360), 0), Math.max(Math.min(s, 100), 0), Math.max(Math.min(x, 100), 0)]
                    }
                    var convert = __webpack_require__(111);
                    Colr.fromHex = function (hex) {
                        return (new Colr).fromHex(hex)
                    }, Colr.fromGrayscale = function (value) {
                        return (new Colr).fromGrayscale(value)
                    }, Colr.fromRgb = function (r, g, b) {
                        return (new Colr).fromRgb(r, g, b)
                    }, Colr.fromRgbArray = function (arr) {
                        return (new Colr).fromRgb(arr[0], arr[1], arr[2])
                    }, Colr.fromRgbObject = function (obj) {
                        return (new Colr).fromRgb(obj.r, obj.g, obj.b)
                    }, Colr.fromHsl = function (h, s, l) {
                        return (new Colr).fromHsl(h, s, l)
                    }, Colr.fromHslArray = function (arr) {
                        return (new Colr).fromHsl(arr[0], arr[1], arr[2])
                    }, Colr.fromHslObject = function (obj) {
                        return (new Colr).fromHsl(obj.h, obj.s, obj.l)
                    }, Colr.fromHsv = function (h, s, v) {
                        return (new Colr).fromHsv(h, s, v)
                    }, Colr.fromHsvArray = function (arr) {
                        return (new Colr).fromHsv(arr[0], arr[1], arr[2])
                    }, Colr.fromHsvObject = function (obj) {
                        return (new Colr).fromHsv(obj.h, obj.s, obj.v)
                    }, Colr.prototype.fromHex = function (input) {
                        var value = convert.hex.rgb(input);
                        return this._ = {
                            rgb: value
                        }, this
                    }, Colr.prototype.fromGrayscale = function (input) {
                        input = clampByte(input);
                        var value = convert.grayscale.rgb(input);
                        return this._ = {
                            rgb: value
                        }, this
                    }, Colr.prototype.fromRgb = function (r, g, b) {
                        if ("number" != typeof r || "number" != typeof g || "number" != typeof b) throw new Error("Arguments must be numbers");
                        var value = clampRgb(r, g, b);
                        return this._ = {
                            rgb: value
                        }, this
                    }, Colr.prototype.fromRgbArray = function (arr) {
                        return this.fromRgb(arr[0], arr[1], arr[2])
                    }, Colr.prototype.fromRgbObject = function (obj) {
                        return this.fromRgb(obj.r, obj.g, obj.b)
                    }, Colr.prototype.fromHsl = function (h, s, l) {
                        if ("number" != typeof h || "number" != typeof s || "number" != typeof l) throw new Error("Arguments must be numbers");
                        return this._ = {
                            hsl: clampHsx(h, s, l)
                        }, this
                    }, Colr.prototype.fromHslArray = function (arr) {
                        return this.fromHsl(arr[0], arr[1], arr[2])
                    }, Colr.prototype.fromHslObject = function (obj) {
                        return this.fromHsl(obj.h, obj.s, obj.l)
                    }, Colr.prototype.fromHsv = function (h, s, v) {
                        if ("number" != typeof h || "number" != typeof s || "number" != typeof v) throw new Error("Arguments must be numbers");
                        return this._ = {
                            hsv: clampHsx(h, s, v)
                        }, this
                    }, Colr.prototype.fromHsvArray = function (arr) {
                        return this.fromHsv(arr[0], arr[1], arr[2])
                    }, Colr.prototype.fromHsvObject = function (obj) {
                        return this.fromHsv(obj.h, obj.s, obj.v)
                    }, Colr.prototype.toHex = function () {
                        var cached = this._.hex;
                        if (void 0 !== cached) return cached;
                        var input, cachedFrom = this._.rgb;
                        input = void 0 !== cachedFrom ? cachedFrom : this.toRawRgbArray(), input[0] = Math.round(input[0]), input[1] = Math.round(input[1]), input[2] = Math.round(input[2]);
                        var value = convert.rgb.hex(input);
                        return this._.hex = value, value
                    }, Colr.prototype.toGrayscale = function () {
                        var cached = this._.grayscale;
                        if (void 0 !== cached) return cached;
                        var input, cachedFrom = this._.rgb;
                        input = void 0 !== cachedFrom ? cachedFrom : this.toRawRgbArray();
                        var value = convert.rgb.grayscale(input);
                        return this._.grayscale = value, value
                    }, Colr.prototype.toRawRgbArray = function () {
                        var cached = this._.rgb;
                        if (void 0 !== cached) return cached;
                        var value;
                        if (void 0 !== (value = this._.hsv)) value = convert.hsv.rgb(value);
                        else {
                            if (void 0 === (value = this._.hsl)) throw new Error("No data to convert");
                            value = convert.hsl.rgb(value)
                        }
                        return this._.rgb = value, value
                    }, Colr.prototype.toRawRgbObject = function () {
                        var arr = this.toRawRgbArray();
                        return {
                            r: arr[0],
                            g: arr[1],
                            b: arr[2]
                        }
                    }, Colr.prototype.toRgbArray = function () {
                        var arr = this.toRawRgbArray();
                        return [Math.round(arr[0]), Math.round(arr[1]), Math.round(arr[2])]
                    }, Colr.prototype.toRgbObject = function () {
                        var arr = this.toRgbArray();
                        return {
                            r: arr[0],
                            g: arr[1],
                            b: arr[2]
                        }
                    }, Colr.prototype.toRawHslArray = function () {
                        var cached = this._.hsl;
                        if (void 0 !== cached) return cached;
                        var value;
                        if (void 0 !== (value = this._.hsv)) value = convert.hsv.hsl(value);
                        else {
                            if (void 0 === (value = this._.rgb)) throw new Error("No data to convert");
                            value = convert.rgb.hsl(value)
                        }
                        return this._.hsl = value, value
                    }, Colr.prototype.toRawHslObject = function () {
                        var arr = this.toRawHslArray();
                        return {
                            h: arr[0],
                            s: arr[1],
                            l: arr[2]
                        }
                    }, Colr.prototype.toHslArray = function () {
                        var arr = this.toRawHslArray();
                        return [Math.round(arr[0]), Math.round(arr[1]), Math.round(arr[2])]
                    }, Colr.prototype.toHslObject = function () {
                        var arr = this.toHslArray();
                        return {
                            h: arr[0],
                            s: arr[1],
                            l: arr[2]
                        }
                    }, Colr.prototype.toRawHsvArray = function () {
                        var cached = this._.hsv;
                        if (void 0 !== cached) return cached;
                        var value;
                        if (void 0 !== (value = this._.hsl)) value = convert.hsl.hsv(value);
                        else {
                            if (void 0 === (value = this._.rgb)) throw new Error("No data to convert");
                            value = convert.rgb.hsv(value)
                        }
                        return this._.hsv = value, value
                    }, Colr.prototype.toRawHsvObject = function () {
                        var arr = this.toRawHsvArray();
                        return {
                            h: arr[0],
                            s: arr[1],
                            v: arr[2]
                        }
                    }, Colr.prototype.toHsvArray = function () {
                        var arr = this.toRawHsvArray();
                        return [Math.round(arr[0]), Math.round(arr[1]), Math.round(arr[2])]
                    }, Colr.prototype.toHsvObject = function () {
                        var arr = this.toHsvArray();
                        return {
                            h: arr[0],
                            s: arr[1],
                            v: arr[2]
                        }
                    }, Colr.prototype.lighten = function (amount) {
                        var hsl = this.toRawHslArray();
                        return hsl[2] = clampPercentage(hsl[2] + amount), this._ = {
                            hsl: hsl
                        }, this
                    }, Colr.prototype.darken = function (amount) {
                        var hsl = this.toRawHslArray();
                        return hsl[2] = clampPercentage(hsl[2] - amount), this._ = {
                            hsl: hsl
                        }, this
                    }, Colr.prototype.clone = function () {
                        var colr = new Colr;
                        return colr._.hex = this._.hex, colr._.grayscale = this._.grayscale, void 0 !== this._.rgb && (colr._.rgb = this._.rgb.slice(0)), void 0 !== this._.hsv && (colr._.hsv = this._.hsv.slice(0)), void 0 !== this._.hsl && (colr._.hsl = this._.hsl.slice(0)), colr
                    }, module.exports = Colr
                }, function (module, exports) {
                    exports.f = {}.propertyIsEnumerable
                }, function (module) {
                    var id = 0,
                        px = Math.random();
                    module.exports = function (key) {
                        return "Symbol(".concat(void 0 === key ? "" : key, ")_", (++id + px).toString(36))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _numericstepper = __webpack_require__(88),
                        _numericstepper2 = _interopRequireDefault(_numericstepper);
                    exports["default"] = _numericstepper2["default"]
                }, function (module, exports) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports["default"] = function (fn) {
                        var rafID = void 0,
                            debounced = function (a) {
                                fn(a), cancelAnimationFrame(rafID), rafID = null
                            };
                        return function (e) {
                            rafID || (e && e.persist && e.persist(), requestAnimationFrame(function () {
                                rafID = requestAnimationFrame(debounced.bind(void 0, e))
                            }))
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _shallowEqual = __webpack_require__(102),
                        _shallowEqual2 = _interopRequireDefault(_shallowEqual),
                        shallowCompare = function (instance, nextProps, nextState) {
                            return !_shallowEqual2["default"](instance.props, nextProps) || !_shallowEqual2["default"](instance.state, nextState)
                        };
                    exports["default"] = shallowCompare
                }, function (module) {
                    var toString = {}.toString;
                    module.exports = function (it) {
                        return toString.call(it).slice(8, -1)
                    }
                }, function (module, exports, __webpack_require__) {
                    var aFunction = __webpack_require__(119);
                    module.exports = function (fn, that, length) {
                        if (aFunction(fn), void 0 === that) return fn;
                        switch (length) {
                            case 1:
                                return function (a) {
                                    return fn.call(that, a)
                                };
                            case 2:
                                return function (a, b) {
                                    return fn.call(that, a, b)
                                };
                            case 3:
                                return function (a, b, c) {
                                    return fn.call(that, a, b, c)
                                }
                        }
                        return function () {
                            return fn.apply(that, arguments)
                        }
                    }
                }, function (module) {
                    module.exports = function (it) {
                        if (void 0 == it) throw TypeError("Can't call method on  " + it);
                        return it
                    }
                }, function (module) {
                    module.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")
                }, function (module) {
                    module.exports = !0
                }, function (module, exports, __webpack_require__) {
                    var anObject = __webpack_require__(19),
                        dPs = __webpack_require__(135),
                        enumBugKeys = __webpack_require__(39),
                        IE_PROTO = __webpack_require__(44)("IE_PROTO"),
                        Empty = function () {},
                        PROTOTYPE = "prototype",
                        createDict = function () {
                            var iframeDocument, iframe = __webpack_require__(62)("iframe"),
                                i = enumBugKeys.length,
                                lt = "<",
                                gt = ">";
                            for (iframe.style.display = "none", __webpack_require__(125).appendChild(iframe), iframe.src = "javascript:", iframeDocument = iframe.contentWindow.document, iframeDocument.open(), iframeDocument.write(lt + "script" + gt + "document.F=Object" + lt + "/script" + gt), iframeDocument.close(), createDict = iframeDocument.F; i--;) delete createDict[PROTOTYPE][enumBugKeys[i]];
                            return createDict()
                        };
                    module.exports = Object.create || function (O, Properties) {
                        var result;
                        return null !== O ? (Empty[PROTOTYPE] = anObject(O), result = new Empty, Empty[PROTOTYPE] = null, result[IE_PROTO] = O) : result = createDict(), void 0 === Properties ? result : dPs(result, Properties)
                    }
                }, function (module, exports) {
                    exports.f = Object.getOwnPropertySymbols
                }, function (module, exports, __webpack_require__) {
                    var def = __webpack_require__(13).f,
                        has = __webpack_require__(16),
                        TAG = __webpack_require__(9)("toStringTag");
                    module.exports = function (it, tag, stat) {
                        it && !has(it = stat ? it : it.prototype, TAG) && def(it, TAG, {
                            configurable: !0,
                            value: tag
                        })
                    }
                }, function (module, exports, __webpack_require__) {
                    var shared = __webpack_require__(45)("keys"),
                        uid = __webpack_require__(32);
                    module.exports = function (key) {
                        return shared[key] || (shared[key] = uid(key))
                    }
                }, function (module, exports, __webpack_require__) {
                    var global = __webpack_require__(12),
                        SHARED = "__core-js_shared__",
                        store = global[SHARED] || (global[SHARED] = {});
                    module.exports = function (key) {
                        return store[key] || (store[key] = {})
                    }
                }, function (module) {
                    var ceil = Math.ceil,
                        floor = Math.floor;
                    module.exports = function (it) {
                        return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it)
                    }
                }, function (module, exports, __webpack_require__) {
                    var defined = __webpack_require__(38);
                    module.exports = function (it) {
                        return Object(defined(it))
                    }
                }, function (module, exports, __webpack_require__) {
                    var isObject = __webpack_require__(24);
                    module.exports = function (it, S) {
                        if (!isObject(it)) return it;
                        var fn, val;
                        if (S && "function" == typeof (fn = it.toString) && !isObject(val = fn.call(it))) return val;
                        if ("function" == typeof (fn = it.valueOf) && !isObject(val = fn.call(it))) return val;
                        if (!S && "function" == typeof (fn = it.toString) && !isObject(val = fn.call(it))) return val;
                        throw TypeError("Can't convert object to primitive value")
                    }
                }, function (module, exports, __webpack_require__) {
                    var global = __webpack_require__(12),
                        core = __webpack_require__(10),
                        LIBRARY = __webpack_require__(40),
                        wksExt = __webpack_require__(50),
                        defineProperty = __webpack_require__(13).f;
                    module.exports = function (name) {
                        var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
                        "_" == name.charAt(0) || name in $Symbol || defineProperty($Symbol, name, {
                            value: wksExt.f(name)
                        })
                    }
                }, function (module, exports, __webpack_require__) {
                    exports.f = __webpack_require__(9)
                }, function (module, exports, __webpack_require__) {
                    (function (setImmediate, clearImmediate) {
                        function Timeout(id, clearFn) {
                            this._id = id, this._clearFn = clearFn
                        }
                        var nextTick = __webpack_require__(72).nextTick,
                            apply = Function.prototype.apply,
                            slice = Array.prototype.slice,
                            immediateIds = {},
                            nextImmediateId = 0;
                        exports.setTimeout = function () {
                            return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout)
                        }, exports.setInterval = function () {
                            return new Timeout(apply.call(setInterval, window, arguments), clearInterval)
                        }, exports.clearTimeout = exports.clearInterval = function (timeout) {
                            timeout.close()
                        }, Timeout.prototype.unref = Timeout.prototype.ref = function () {}, Timeout.prototype.close = function () {
                            this._clearFn.call(window, this._id)
                        }, exports.enroll = function (item, msecs) {
                            clearTimeout(item._idleTimeoutId), item._idleTimeout = msecs
                        }, exports.unenroll = function (item) {
                            clearTimeout(item._idleTimeoutId), item._idleTimeout = -1
                        }, exports._unrefActive = exports.active = function (item) {
                            clearTimeout(item._idleTimeoutId);
                            var msecs = item._idleTimeout;
                            msecs >= 0 && (item._idleTimeoutId = setTimeout(function () {
                                item._onTimeout && item._onTimeout()
                            }, msecs))
                        }, exports.setImmediate = "function" == typeof setImmediate ? setImmediate : function (fn) {
                            var id = nextImmediateId++,
                                args = arguments.length < 2 ? !1 : slice.call(arguments, 1);
                            return immediateIds[id] = !0, nextTick(function () {
                                immediateIds[id] && (args ? fn.apply(null, args) : fn.call(null), exports.clearImmediate(id))
                            }), id
                        }, exports.clearImmediate = "function" == typeof clearImmediate ? clearImmediate : function (id) {
                            delete immediateIds[id]
                        }
                    }).call(exports, __webpack_require__(51).setImmediate, __webpack_require__(51).clearImmediate)
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.button = void 0;
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _button = __webpack_require__(73),
                        _button2 = _interopRequireDefault(_button),
                        _annotate = __webpack_require__(11);
                    exports["default"] = _button2["default"];
                    exports.button = function (options) {
                        return _annotate.annotate(_extends3["default"]({}, options, {
                            control: _button2["default"]
                        }))
                    }
                }, function (module, exports) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    exports.rgbObject = function (color) {
                        return "r" in color && "number" == typeof color.r && "g" in color && "number" == typeof color.g && "b" in color && "number" == typeof color.b
                    }, exports.rgbArray = function (color) {
                        return color instanceof Array && color.length >= 3
                    }, exports.hslObject = function (color) {
                        return "h" in color && "number" == typeof color.h && "s" in color && "number" == typeof color.s && "l" in color && "number" == typeof color.l
                    }, exports.hsvObject = function (color) {
                        return "h" in color && "number" == typeof color.h && "s" in color && "number" == typeof color.s && "v" in color && "number" == typeof color.v
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _slider = __webpack_require__(91),
                        _slider2 = _interopRequireDefault(_slider);
                    exports["default"] = _slider2["default"]
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _textinput = __webpack_require__(92),
                        _textinput2 = _interopRequireDefault(_textinput);
                    exports["default"] = _textinput2["default"]
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _preactSvg = __webpack_require__(21),
                        _preactSvg2 = _interopRequireDefault(_preactSvg);
                    exports["default"] = function (props) {
                        return _preact2["default"].h(_preactSvg2["default"], {
                            fill: "currentColor",
                            fit: "true",
                            height: "1em",
                            width: "1em",
                            viewBox: "0 0 40 40",
                            preserveAspectRatio: "xMidYMid meet",
                            style: _extends3["default"]({
                                verticalAlign: "middle"
                            }, props.style)
                        }, _preact2["default"].h("g", null, _preact2["default"].h("path", {
                            d: "m20 13.4l10 10-2.3 2.3-7.7-7.7-7.7 7.7-2.3-2.3z"
                        })))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _preactSvg = __webpack_require__(21),
                        _preactSvg2 = _interopRequireDefault(_preactSvg);
                    exports["default"] = function (props) {
                        return _preact2["default"].h(_preactSvg2["default"], {
                            fill: "currentColor",
                            fit: "true",
                            height: "1em",
                            width: "1em",
                            viewBox: "0 0 40 40",
                            preserveAspectRatio: "xMidYMid meet",
                            style: _extends3["default"]({
                                verticalAlign: "middle"
                            }, props.style)
                        }, _preact2["default"].h("g", null, _preact2["default"].h("path", {
                            d: "m27.7 14.3l2.3 2.3-10 10-10-10 2.3-2.3 7.7 7.7z"
                        })))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }

                    function prender(vnode, parent, callback) {
                        var prev = parent._preactCompatRendered;
                        prev && prev.parentNode !== parent && (prev = null);
                        var out = _preact.render(vnode, parent, prev);
                        return parent._preactCompatRendered = out, "function" == typeof callback && callback(), out && out._component
                    }

                    function unmountComponentAtNode(container) {
                        var existing = container._preactCompatRendered;
                        return existing && existing.parentNode === container ? (_preact.render(_preact2["default"].h(EmptyComponent), container, existing), !0) : !1
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _renderTree = __webpack_require__(59),
                        _renderTree2 = _interopRequireDefault(_renderTree),
                        _panel = __webpack_require__(89),
                        _panel2 = _interopRequireDefault(_panel),
                        _dom = __webpack_require__(99),
                        _dom2 = _interopRequireDefault(_dom),
                        _deepMerge = __webpack_require__(98),
                        _deepMerge2 = _interopRequireDefault(_deepMerge),
                        _warn = __webpack_require__(29),
                        _warn2 = _interopRequireDefault(_warn),
                        EmptyComponent = function () {
                            return null
                        };
                    exports["default"] = function (opts) {
                        var container = null,
                            render = function render(api) {
                                var callback = arguments.length <= 1 || void 0 === arguments[1] ? function (_) {
                                    return _
                                } : arguments[1];
                                if (document.contains(_dom2["default"]) || document.body.appendChild(_dom2["default"]), api ? null === container && (container = document.createElement("div"), container.style.margin = "0.25em", container.style.flexBasis = "auto", _dom2["default"].appendChild(container)) : (unmountComponentAtNode(container), _dom2["default"].removeChild(container), container = null), api) {
                                    var onChange = function (change) {
                                            var isFrozen = Object.isFrozen(api);
                                            _warn2["default"](Object.isFrozen(api), "The `api` object is frozen an cannot be mutated."), isFrozen || (render(_deepMerge2["default"](api, change), callback), callback(api))
                                        },
                                        Element = _preact2["default"].h(_panel2["default"], opts, _renderTree2["default"](api, onChange));
                                    prender(Element, container)
                                }
                            };
                        return render
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }); {
                        var _extends2 = __webpack_require__(1),
                            _extends3 = _interopRequireDefault(_extends2),
                            _typeof2 = __webpack_require__(18),
                            _typeof3 = _interopRequireDefault(_typeof2),
                            _preact = __webpack_require__(2),
                            _preact2 = _interopRequireDefault(_preact),
                            _annotate = __webpack_require__(11),
                            _primitiveComponents = __webpack_require__(101),
                            _primitiveComponents2 = _interopRequireDefault(_primitiveComponents),
                            _validation = __webpack_require__(103),
                            _warn = __webpack_require__(29);
                        _interopRequireDefault(_warn)
                    }
                    exports["default"] = function (obj, onChange) {
                        var annotation = void 0,
                            components = [];
                        for (var prop in obj) {
                            var _Component = void 0,
                                value = obj[prop];
                            null !== value && (annotation = _annotate.getAnnotation(obj, prop) || {}, _Component = annotation.control, _Component ? _validation.validateProp(obj, prop, _Component) : !_Component && _primitiveComponents2["default"].has("undefined" == typeof value ? "undefined" : _typeof3["default"](value)) && (_Component = _primitiveComponents2["default"].get("undefined" == typeof value ? "undefined" : _typeof3["default"](value))), _Component && components.push(_preact2["default"].h(_Component, _extends3["default"]({
                                key: prop,
                                id: prop,
                                label: prop
                            }, annotation, {
                                onChange: onChange,
                                value: value
                            }))))
                        }
                        return components
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = {
                        "default": __webpack_require__(115),
                        __esModule: !0
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    exports.__esModule = !0;
                    var _defineProperty = __webpack_require__(60),
                        _defineProperty2 = _interopRequireDefault(_defineProperty);
                    exports["default"] = function (obj, key, value) {
                        return key in obj ? _defineProperty2["default"](obj, key, {
                            value: value,
                            enumerable: !0,
                            configurable: !0,
                            writable: !0
                        }) : obj[key] = value, obj
                    }
                }, function (module, exports, __webpack_require__) {
                    var isObject = __webpack_require__(24),
                        document = __webpack_require__(12).document,
                        is = isObject(document) && isObject(document.createElement);
                    module.exports = function (it) {
                        return is ? document.createElement(it) : {}
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = !__webpack_require__(14) && !__webpack_require__(23)(function () {
                        return 7 != Object.defineProperty(__webpack_require__(62)("div"), "a", {
                            get: function () {
                                return 7
                            }
                        }).a
                    })
                }, function (module, exports, __webpack_require__) {
                    var cof = __webpack_require__(36);
                    module.exports = Object("z").propertyIsEnumerable(0) ? Object : function (it) {
                        return "String" == cof(it) ? it.split("") : Object(it)
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    var LIBRARY = __webpack_require__(40),
                        $export = __webpack_require__(15),
                        redefine = __webpack_require__(69),
                        hide = __webpack_require__(20),
                        has = __webpack_require__(16),
                        Iterators = __webpack_require__(25),
                        $iterCreate = __webpack_require__(129),
                        setToStringTag = __webpack_require__(43),
                        getPrototypeOf = __webpack_require__(137),
                        ITERATOR = __webpack_require__(9)("iterator"),
                        BUGGY = !([].keys && "next" in [].keys()),
                        FF_ITERATOR = "@@iterator",
                        KEYS = "keys",
                        VALUES = "values",
                        returnThis = function () {
                            return this
                        };
                    module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
                        $iterCreate(Constructor, NAME, next);
                        var methods, key, IteratorPrototype, getMethod = function (kind) {
                                if (!BUGGY && kind in proto) return proto[kind];
                                switch (kind) {
                                    case KEYS:
                                        return function () {
                                            return new Constructor(this, kind)
                                        };
                                    case VALUES:
                                        return function () {
                                            return new Constructor(this, kind)
                                        }
                                }
                                return function () {
                                    return new Constructor(this, kind)
                                }
                            },
                            TAG = NAME + " Iterator",
                            DEF_VALUES = DEFAULT == VALUES,
                            VALUES_BUG = !1,
                            proto = Base.prototype,
                            $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
                            $default = $native || getMethod(DEFAULT),
                            $entries = DEFAULT ? DEF_VALUES ? getMethod("entries") : $default : void 0,
                            $anyNative = "Array" == NAME ? proto.entries || $native : $native;
                        if ($anyNative && (IteratorPrototype = getPrototypeOf($anyNative.call(new Base)), IteratorPrototype !== Object.prototype && (setToStringTag(IteratorPrototype, TAG, !0), LIBRARY || has(IteratorPrototype, ITERATOR) || hide(IteratorPrototype, ITERATOR, returnThis))), DEF_VALUES && $native && $native.name !== VALUES && (VALUES_BUG = !0, $default = function () {
                                return $native.call(this)
                            }), LIBRARY && !FORCED || !BUGGY && !VALUES_BUG && proto[ITERATOR] || hide(proto, ITERATOR, $default), Iterators[NAME] = $default, Iterators[TAG] = returnThis, DEFAULT)
                            if (methods = {
                                    values: DEF_VALUES ? $default : getMethod(VALUES),
                                    keys: IS_SET ? $default : getMethod(KEYS),
                                    entries: $entries
                                }, FORCED)
                                for (key in methods) key in proto || redefine(proto, key, methods[key]);
                            else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
                        return methods
                    }
                }, function (module, exports, __webpack_require__) {
                    var pIE = __webpack_require__(31),
                        createDesc = __webpack_require__(27),
                        toIObject = __webpack_require__(17),
                        toPrimitive = __webpack_require__(48),
                        has = __webpack_require__(16),
                        IE8_DOM_DEFINE = __webpack_require__(63),
                        gOPD = Object.getOwnPropertyDescriptor;
                    exports.f = __webpack_require__(14) ? gOPD : function (O, P) {
                        if (O = toIObject(O), P = toPrimitive(P, !0), IE8_DOM_DEFINE) try {
                            return gOPD(O, P)
                        } catch (e) {}
                        return has(O, P) ? createDesc(!pIE.f.call(O, P), O[P]) : void 0
                    }
                }, function (module, exports, __webpack_require__) {
                    var $keys = __webpack_require__(68),
                        hiddenKeys = __webpack_require__(39).concat("length", "prototype");
                    exports.f = Object.getOwnPropertyNames || function (O) {
                        return $keys(O, hiddenKeys)
                    }
                }, function (module, exports, __webpack_require__) {
                    var has = __webpack_require__(16),
                        toIObject = __webpack_require__(17),
                        arrayIndexOf = __webpack_require__(121)(!1),
                        IE_PROTO = __webpack_require__(44)("IE_PROTO");
                    module.exports = function (object, names) {
                        var key, O = toIObject(object),
                            i = 0,
                            result = [];
                        for (key in O) key != IE_PROTO && has(O, key) && result.push(key);
                        for (; names.length > i;) has(O, key = names[i++]) && (~arrayIndexOf(result, key) || result.push(key));
                        return result
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = __webpack_require__(20)
                }, function (module, exports, __webpack_require__) {
                    var toInteger = __webpack_require__(46),
                        min = Math.min;
                    module.exports = function (it) {
                        return it > 0 ? min(toInteger(it), 9007199254740991) : 0
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    var $at = __webpack_require__(139)(!0);
                    __webpack_require__(65)(String, "String", function (iterated) {
                        this._t = String(iterated), this._i = 0
                    }, function () {
                        var point, O = this._t,
                            index = this._i;
                        return index >= O.length ? {
                            value: void 0,
                            done: !0
                        } : (point = $at(O, index), this._i += point.length, {
                            value: point,
                            done: !1
                        })
                    })
                }, function (module) {
                    function cleanUpNextTick() {
                        draining && currentQueue && (draining = !1, currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1, queue.length && drainQueue())
                    }

                    function drainQueue() {
                        if (!draining) {
                            var timeout = cachedSetTimeout(cleanUpNextTick);
                            draining = !0;
                            for (var len = queue.length; len;) {
                                for (currentQueue = queue, queue = []; ++queueIndex < len;) currentQueue && currentQueue[queueIndex].run();
                                queueIndex = -1, len = queue.length
                            }
                            currentQueue = null, draining = !1, cachedClearTimeout(timeout)
                        }
                    }

                    function Item(fun, array) {
                        this.fun = fun, this.array = array
                    }

                    function noop() {}
                    var cachedSetTimeout, cachedClearTimeout, process = module.exports = {};
                    ! function () {
                        try {
                            cachedSetTimeout = setTimeout
                        } catch (e) {
                            cachedSetTimeout = function () {
                                throw new Error("setTimeout is not defined")
                            }
                        }
                        try {
                            cachedClearTimeout = clearTimeout
                        } catch (e) {
                            cachedClearTimeout = function () {
                                throw new Error("clearTimeout is not defined")
                            }
                        }
                    }();
                    var currentQueue, queue = [],
                        draining = !1,
                        queueIndex = -1;
                    process.nextTick = function (fun) {
                        var args = new Array(arguments.length - 1);
                        if (arguments.length > 1)
                            for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
                        queue.push(new Item(fun, args)), 1 !== queue.length || draining || cachedSetTimeout(drainQueue, 0)
                    }, Item.prototype.run = function () {
                        this.fun.apply(null, this.array)
                    }, process.title = "browser", process.browser = !0, process.env = {}, process.argv = [], process.version = "", process.versions = {}, process.on = noop, process.addListener = noop, process.once = noop, process.off = noop, process.removeListener = noop, process.removeAllListeners = noop, process.emit = noop, process.binding = function () {
                        throw new Error("process.binding is not supported")
                    }, process.cwd = function () {
                        return "/"
                    }, process.chdir = function () {
                        throw new Error("process.chdir is not supported")
                    }, process.umask = function () {
                        return 0
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _styles = __webpack_require__(8),
                        defaultStyle = {
                            cursor: "pointer",
                            outline: "none",
                            border: "none",
                            padding: "1em",
                            borderRadius: 2,
                            verticalAlign: "middle",
                            textAlign: "center",
                            lineHeight: "50%",
                            ":hover": {
                                backgroundColor: _styles.highlight.color,
                                color: "white"
                            }
                        },
                        Button = function (props) {
                            return _preact2["default"].h("button", _extends3["default"]({}, props, {
                                style: _extends3["default"]({}, _styles.base, defaultStyle, props.style),
                                onClick: props.value
                            }), props.label)
                        };
                    Button.defaultProps = {
                        label: "Button"
                    }, Button.propTypes = {
                        value: _proptypes2["default"].func.isRequired,
                        label: _proptypes2["default"].string,
                        style: _proptypes2["default"].object
                    }, exports["default"] = Button
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _styles = __webpack_require__(8),
                        Checkbox = function (_React$Component) {
                            function Checkbox() {
                                return _classCallCheck3["default"](this, Checkbox), _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(Checkbox).apply(this, arguments))
                            }
                            return _inherits3["default"](Checkbox, _React$Component), _createClass3["default"](Checkbox, [{
                                key: "render",
                                value: function () {
                                    var _props = this.props,
                                        value = _props.value,
                                        label = _props.label,
                                        _onChange = _props.onChange;
                                    return _preact2["default"].h("div", {
                                        style: _extends3["default"]({}, _styles.base, defaultStyle, {
                                            alignItems: "center"
                                        }),
                                        onClick: function () {
                                            return _onChange(!value)
                                        }
                                    }, _preact2["default"].h("label", {
                                        style: _styles.base
                                    }, label), _preact2["default"].h("input", {
                                        checked: value,
                                        style: alignRight,
                                        type: "checkbox",
                                        onChange: function (evt) {
                                            return _onChange(evt.target.checked)
                                        }
                                    }))
                                }
                            }]), Checkbox
                        }(_preact2["default"].Component);
                    Checkbox.propTypes = {
                        label: _proptypes2["default"].string,
                        value: _proptypes2["default"].bool,
                        onChange: _proptypes2["default"].func
                    }, Checkbox.defaultProps = {
                        label: "Checkbox",
                        value: !1,
                        onChange: function (a) {
                            return a
                        }
                    };
                    var defaultStyle = {
                            display: "flex"
                        },
                        alignRight = {
                            marginLeft: "auto"
                        };
                    exports["default"] = Checkbox
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _checkbox = __webpack_require__(74),
                        _checkbox2 = _interopRequireDefault(_checkbox);
                    exports["default"] = _checkbox2["default"]
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.hsv2Hsv = exports.rgbArr2Hsv = exports.rgb2Hsv = void 0;
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _validators = __webpack_require__(53),
                        _colr = __webpack_require__(30),
                        _colr2 = _interopRequireDefault(_colr),
                        withAlpha = function (color, a) {
                            return void 0 !== a ? _extends3["default"]({
                                a: a
                            }, color) : color
                        },
                        normalizeRGB = function (c) {
                            return {
                                r: 255 * c.r,
                                g: 255 * c.g,
                                b: 255 * c.b
                            }
                        },
                        deNormalizeRGB = function (c) {
                            return {
                                r: c.r / 255,
                                g: c.g / 255,
                                b: c.b / 255
                            }
                        },
                        rgb2Hsv = exports.rgb2Hsv = function (c) {
                            return withAlpha(_colr2["default"].fromRgbObject(normalizeRGB(c)).toRawHsvObject(), c.a)
                        },
                        rgbArr2Hsv = exports.rgbArr2Hsv = function (c) {
                            return withAlpha(_colr2["default"].fromRgbArray(c.map(function (channel) {
                                return 255 * channel
                            })).toRawHsvObject(), c[3])
                        },
                        hsv2Hsv = exports.hsv2Hsv = function (c) {
                            return c
                        };
                    rgb2Hsv.invert = function (c) {
                        return withAlpha(deNormalizeRGB(_colr2["default"].fromHsvObject(c).toRawRgbObject()), c.a)
                    }, rgbArr2Hsv.invert = function (c) {
                        return _colr2["default"].fromHsvObject(c).toRawRgbArray().map(function (channel) {
                            return channel / 255
                        }).concat([c.a])
                    }, hsv2Hsv.invert = function (c) {
                        return c
                    }, exports["default"] = function (value) {
                        var converter = hsv2Hsv;
                        return _validators.rgbObject(value) ? converter = rgb2Hsv : _validators.rgbArray(value) && (converter = rgbArr2Hsv), converter
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _hsvColorpicker = __webpack_require__(79),
                        _hsvColorpicker2 = _interopRequireDefault(_hsvColorpicker),
                        _colr = __webpack_require__(30),
                        _colr2 = _interopRequireDefault(_colr),
                        _palette = __webpack_require__(81),
                        _palette2 = _interopRequireDefault(_palette),
                        _styles = __webpack_require__(8),
                        _colorConverter = __webpack_require__(76),
                        _colorConverter2 = _interopRequireDefault(_colorConverter),
                        _validators = __webpack_require__(53),
                        ColorPicker = function (_Component) {
                            function ColorPicker() {
                                _classCallCheck3["default"](this, ColorPicker);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(ColorPicker).call(this));
                                return _this.state = {
                                    colors: []
                                }, _this.getSystemColors = function () {
                                    return JSON.parse(localStorage.getItem("oui.colorpicker")) || []
                                }, _this.setSystemColors = function (colors) {
                                    return localStorage.setItem("oui.colorpicker", JSON.stringify(colors))
                                }, _this.onColorChange = function (hsv) {
                                    var color = _colorConverter2["default"](_this.props.value).invert(hsv);
                                    _this.props.onChange(color)
                                }, _this
                            }
                            return _inherits3["default"](ColorPicker, _Component), _createClass3["default"](ColorPicker, [{
                                key: "onAddColorClick",
                                value: function (color) {
                                    var colors = this.getSystemColors();
                                    colors.push(color), this.setSystemColors(colors), this.forceUpdate()
                                }
                            }, {
                                key: "onRemoveColorClick",
                                value: function (color, index) {
                                    var colors = this.getSystemColors();
                                    colors.splice(index, 1), this.setSystemColors(colors), this.forceUpdate()
                                }
                            }, {
                                key: "componentWillMount",
                                value: function () {
                                    this.setState({
                                        open: this.props.open
                                    })
                                }
                            }, {
                                key: "render",
                                value: function () {
                                    var _this2 = this,
                                        _props = this.props,
                                        value = _props.value,
                                        label = _props.label,
                                        style = (_props.onChange, _props.style),
                                        palette = _props.palette,
                                        _state = this.state,
                                        open = (_state.colors, _state.open),
                                        toHsv = _colorConverter2["default"](value),
                                        hsvColor = toHsv(value);
                                    return _preact2["default"].h("div", {
                                        style: _extends3["default"]({}, _styles.base, style, {
                                            height: "auto"
                                        })
                                    }, _preact2["default"].h("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center"
                                        },
                                        onClick: function () {
                                            return _this2.setState({
                                                open: !open
                                            })
                                        }
                                    }, _preact2["default"].h("label", null, label), _preact2["default"].h("span", {
                                        style: _extends3["default"]({}, colorDropletStyle, {
                                            marginLeft: "auto",
                                            backgroundColor: _colr2["default"].fromHsvObject(hsvColor).toHex()
                                        })
                                    })), open ? _preact2["default"].h("div", null, _preact2["default"].h(_hsvColorpicker2["default"], {
                                        style: style,
                                        value: hsvColor,
                                        onChange: this.onColorChange
                                    }), _preact2["default"].h(_palette2["default"], {
                                        key: "user-palette",
                                        values: palette.map(toHsv),
                                        onSelect: this.onColorChange
                                    }), _preact2["default"].h(_palette2["default"], {
                                        key: "system-palette",
                                        values: this.getSystemColors(),
                                        onSelect: this.onColorChange,
                                        onDeselect: this.onRemoveColorClick.bind(this)
                                    }), _preact2["default"].h("div", {
                                        onClick: function () {
                                            return _this2.onAddColorClick(toHsv(value))
                                        }
                                    })) : null)
                                }
                            }]), ColorPicker
                        }(_preact.Component);
                    ColorPicker.displayName = "ColorPicker";
                    var ValuePropTypeError = function (propName, componentName) {
                            return new Error("Invalid prop `" + propName + "` supplied to `" + componentName + "`. Validation failed.")
                        },
                        rgbObjectPropType = function (props, propName, componentName) {
                            return _validators.rgbObject(props[propName]) ? void 0 : ValuePropTypeError(propName, componentName)
                        },
                        rgbArrayPropType = function (props, propName, componentName) {
                            return _validators.rgbArray(props[propName]) ? void 0 : ValuePropTypeError(propName, componentName)
                        },
                        hsvObjectPropType = function (props, propName, componentName) {
                            return _validators.hsvObject(props[propName]) ? void 0 : ValuePropTypeError(propName, componentName)
                        };
                    ColorPicker.propTypes = {
                        label: _proptypes2["default"].string,
                        open: _proptypes2["default"].bool,
                        value: _proptypes2["default"].oneOfType([rgbObjectPropType, rgbArrayPropType, hsvObjectPropType]),
                        palette: _proptypes2["default"].oneOfType([_proptypes2["default"].arrayOf(rgbObjectPropType), _proptypes2["default"].arrayOf(rgbArrayPropType), _proptypes2["default"].arrayOf(hsvObjectPropType)]),
                        style: _proptypes2["default"].object,
                        onChange: _proptypes2["default"].func
                    }, ColorPicker.defaultProps = {
                        open: !1,
                        label: "ColorPicker",
                        value: {
                            h: 1,
                            s: 50,
                            v: 50
                        },
                        palette: [],
                        onChange: function (a) {
                            return a
                        }
                    };
                    var colorDropletStyle = ({
                        ":hover": _styles.secondary
                    }, {
                        borderRadius: "50%",
                        width: "1em",
                        height: "1em",
                        "float": "right"
                    });
                    exports["default"] = ColorPicker
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        isDegenerate = function (_ref) {
                            var s = (_ref.h, _ref.s),
                                v = _ref.v;
                            return 0 === s || 0 === v
                        };
                    exports["default"] = function (Comp) {
                        return function (_React$Component) {
                            function RGB2HSV() {
                                _classCallCheck3["default"](this, RGB2HSV);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(RGB2HSV).call(this));
                                return _this.state = {
                                    value: null
                                }, _this.conditionalChange = function (value) {
                                    isDegenerate(value) ? _this.setState({
                                        value: value
                                    }) : (_this.setState({
                                        value: null
                                    }), _this.props.onChange(value))
                                }, _this;

                            }
                            return _inherits3["default"](RGB2HSV, _React$Component), _createClass3["default"](RGB2HSV, [{
                                key: "render",
                                value: function () {
                                    var _this2 = this;
                                    return _preact2["default"].h(Comp, _extends3["default"]({}, this.props, {
                                        value: this.state.value || this.props.value,
                                        onChange: function (change) {
                                            return _this2.conditionalChange(change)
                                        }
                                    }))
                                }
                            }]), RGB2HSV
                        }(_preact2["default"].Component)
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _preactSvg = __webpack_require__(21),
                        _preactSvg2 = _interopRequireDefault(_preactSvg),
                        _colr = __webpack_require__(30),
                        _colr2 = _interopRequireDefault(_colr),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _catchDegenerateHsv = __webpack_require__(78),
                        _catchDegenerateHsv2 = _interopRequireDefault(_catchDegenerateHsv),
                        _slider = __webpack_require__(54),
                        _slider2 = _interopRequireDefault(_slider),
                        _numericstepper = __webpack_require__(33),
                        _textinput = (_interopRequireDefault(_numericstepper), __webpack_require__(55)),
                        _textinput2 = _interopRequireDefault(_textinput),
                        _throttle = (__webpack_require__(22), __webpack_require__(34)),
                        _throttle2 = _interopRequireDefault(_throttle),
                        _styles = __webpack_require__(8),
                        _shallowCompare = __webpack_require__(35),
                        _shallowCompare2 = _interopRequireDefault(_shallowCompare),
                        HSVColorPicker = function (_React$Component) {
                            function HSVColorPicker() {
                                _classCallCheck3["default"](this, HSVColorPicker);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(HSVColorPicker).call(this));
                                _this.state = {
                                    drag: !1,
                                    boundingRect: null
                                };
                                var computeHsvaFromMouseEvent = function (e, bounds) {
                                    var x = void 0 === e.clientX ? e.touches[0].clientX : e.clientX,
                                        y = void 0 === e.clientY ? e.touches[0].clientY : e.clientY,
                                        value = _this.props.value,
                                        h = value.h,
                                        s = (x - bounds.left) / bounds.width * 100,
                                        v = (bounds.height - (y - bounds.top)) / bounds.height * 100,
                                        a = _this.props.value.a;
                                    return s = Math.min(100, Math.max(0, s)), v = Math.min(100, Math.max(0, v)), void 0 === a ? {
                                        h: h,
                                        s: s,
                                        v: v
                                    } : {
                                        h: h,
                                        s: s,
                                        v: v,
                                        a: a
                                    }
                                };
                                return _this.onMouseDown = function (e) {
                                    e.preventDefault();
                                    var rect = e.currentTarget.getBoundingClientRect();
                                    document.addEventListener("mousemove", _this.onMouseMove), document.addEventListener("touchmove", _this.onMouseMove), document.addEventListener("mouseup", _this.onMouseUp), document.addEventListener("touchend", _this.onMouseUp);
                                    var hsv = computeHsvaFromMouseEvent(e, rect);
                                    _this.setState({
                                        drag: !0,
                                        boundingRect: rect
                                    }), _this.props.onChange(hsv)
                                }, _this.onMouseMove = _throttle2["default"](function (e) {
                                    e.preventDefault(), _this.state.drag && _this.props.onChange(computeHsvaFromMouseEvent(e, _this.state.boundingRect))
                                }), _this.onMouseUp = function () {
                                    document.removeEventListener("mousemove", _this.onMouseMove), document.removeEventListener("touchmove", _this.onMouseMove), document.removeEventListener("mouseup", _this.onMouseUp), document.removeEventListener("touchend", _this.onMouseUp), _this.setState({
                                        drag: !1
                                    })
                                }, _this.onChannelChange = function (channel) {
                                    _this.props.onChange(_extends3["default"]({}, _this.props.value, channel))
                                }, _this.onHexChange = function (hex) {
                                    _this.props.onChange(_extends3["default"]({}, _this.props.value, _colr2["default"].fromHex(hex).toHsvObject()))
                                }, _this
                            }
                            return _inherits3["default"](HSVColorPicker, _React$Component), _createClass3["default"](HSVColorPicker, [{
                                key: "shouldComponentUpdate",
                                value: function (nextProps, nextState) {
                                    var _props$value = this.props.value,
                                        h = _props$value.h,
                                        s = _props$value.s,
                                        v = _props$value.v,
                                        a = _props$value.a,
                                        color = nextProps.value;
                                    return (h !== color.h || s !== color.s || v !== color.v || a !== color.a) && _shallowCompare2["default"](this, nextProps, nextState)
                                }
                            }, {
                                key: "render",
                                value: function () {
                                    var _this2 = this,
                                        _props = this.props,
                                        value = (_props.label, _props.onChange, _props.value),
                                        style = _props.style,
                                        h = value.h,
                                        s = value.s,
                                        v = value.v,
                                        a = value.a;
                                    style = style || HSVColorPicker.defaultProps.style;
                                    var uuid = Math.floor(999999999999999 * Math.random());
                                    return _preact2["default"].h("div", null, _preact2["default"].h("div", {
                                        style: _extends3["default"]({}, _styles.base, style)
                                    }, _preact2["default"].h(_preactSvg2["default"], {
                                        width: "100%",
                                        height: "100%",
                                        version: "1.1",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        style: defaultStyle,
                                        onMouseDown: this.onMouseDown,
                                        onMouseUp: this.onMouseUp,
                                        onTouchStart: this.onMouseDown,
                                        onTouchEnd: this.onMouseUp
                                    }, _preact2["default"].h("defs", null, _preact2["default"].h("linearGradient", {
                                        id: "horizontal-gradient" + uuid
                                    }, _preact2["default"].h("stop", {
                                        offset: "0%",
                                        "stop-color": "white"
                                    }), _preact2["default"].h("stop", {
                                        offset: "100%",
                                        "stop-color": "hsl(" + h + ",100%,50%)"
                                    })), _preact2["default"].h("linearGradient", {
                                        id: "vertical-gradient" + uuid,
                                        x1: "0",
                                        x2: "0",
                                        y1: "0",
                                        y2: "1"
                                    }, _preact2["default"].h("stop", {
                                        offset: "0%",
                                        "stop-color": "black",
                                        "stop-opacity": "0"
                                    }), _preact2["default"].h("stop", {
                                        offset: "100%",
                                        "stop-color": "black"
                                    })), _preact2["default"].h("linearGradient", {
                                        id: "alpha-gradient",
                                        x1: "0",
                                        x2: "1",
                                        y1: "0",
                                        y2: "0"
                                    }, _preact2["default"].h("stop", {
                                        offset: "0%",
                                        "stop-color": "hsl(" + h + ",100%,50%)",
                                        "stop-opacity": "0"
                                    }), _preact2["default"].h("stop", {
                                        offset: "100%",
                                        "stop-color": "hsl(" + h + ",100%,50%)",
                                        "stop-opacity": "100"
                                    })), _preact2["default"].h("linearGradient", {
                                        id: "hsv-gradient"
                                    }, stops)), _preact2["default"].h("rect", {
                                        width: "100%",
                                        height: "100%",
                                        style: rect,
                                        fill: "url(#horizontal-gradient" + uuid + ")"
                                    }), _preact2["default"].h("rect", {
                                        width: "100%",
                                        height: "100%",
                                        style: rect,
                                        fill: "url(#vertical-gradient" + uuid + ")"
                                    }), _preact2["default"].h("circle", {
                                        fill: "none",
                                        stroke: "white",
                                        "stroke-width": "1.5",
                                        r: "0.3em",
                                        cx: s + "%",
                                        cy: 100 - v + "%"
                                    }))), _preact2["default"].h(_slider2["default"], {
                                        includeStepper: !1,
                                        label: "",
                                        step: 1,
                                        min: 0,
                                        max: 359,
                                        value: h,
                                        style: hueSlider,
                                        onChange: function (h) {
                                            return _this2.onChannelChange({
                                                h: h
                                            })
                                        }
                                    }), void 0 !== a ? _preact2["default"].h(_slider2["default"], {
                                        includeStepper: !1,
                                        label: "alpha",
                                        step: .001,
                                        min: 0,
                                        max: 1,
                                        value: a,
                                        style: alphaSlider,
                                        onChange: function (a) {
                                            return _this2.onChannelChange({
                                                a: a
                                            })
                                        }
                                    }) : null, _preact2["default"].h(_textinput2["default"], {
                                        label: "#",
                                        value: _colr2["default"].fromHsvObject(value).toHex().slice(1).toUpperCase(),
                                        pattern: /^[0-9A-F]{2,6}$/i,
                                        onSubmit: this.onHexChange
                                    }))
                                }
                            }]), HSVColorPicker
                        }(_preact2["default"].Component);
                    HSVColorPicker.defaultProps = {
                        label: "HSVColorPicker",
                        style: {
                            width: "100%",
                            height: 150
                        },
                        value: {
                            h: 0,
                            s: 80,
                            l: 50
                        }
                    }, HSVColorPicker.propTypes = {
                        label: _proptypes2["default"].string,
                        value: _proptypes2["default"].shape({
                            h: _proptypes2["default"].number.isRequired,
                            s: _proptypes2["default"].number.isRequired,
                            v: _proptypes2["default"].number.isRequired
                        }).isRequired,
                        style: _proptypes2["default"].object
                    };
                    var defaultStyle = {
                            cursor: "default",
                            display: "block"
                        },
                        hueSlider = {
                            backgroundBar: {
                                fill: "url(#hsv-gradient)"
                            },
                            bar: {
                                fill: "none"
                            },
                            thumb: {
                                fill: "white"
                            },
                            padding: "1em"
                        },
                        alphaSlider = {
                            backgroundBar: {
                                fill: "url(#alpha-gradient)"
                            },
                            bar: {
                                fill: "none"
                            },
                            thumb: {
                                fill: "white"
                            },
                            padding: "1em"
                        },
                        rect = {
                            rx: _styles.base.borderRadius,
                            ry: _styles.base.borderRadius
                        },
                        createLinearGradientOfSVGStops = function (steps) {
                            for (var l = 0, i = 100 / steps, stops = []; l++ < steps;) stops.push(_preact2["default"].h("stop", {
                                offset: String(i * l) + "%",
                                key: l,
                                "stop-color": "hsl( " + 360 * l / steps + ", 100%, 50% )"
                            }));
                            return stops
                        },
                        stops = createLinearGradientOfSVGStops(100);
                    exports["default"] = _catchDegenerateHsv2["default"](HSVColorPicker)
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.color = void 0;
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _colorpicker = __webpack_require__(77),
                        _colorpicker2 = _interopRequireDefault(_colorpicker),
                        _annotate = __webpack_require__(11),
                        _withChangeObject = __webpack_require__(28),
                        _withChangeObject2 = _interopRequireDefault(_withChangeObject),
                        control = _withChangeObject2["default"](_colorpicker2["default"]);
                    exports["default"] = control;
                    exports.color = function (options) {
                        return _annotate.annotate(_extends3["default"]({}, options, {
                            control: control
                        }))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _colr = __webpack_require__(30),
                        _colr2 = _interopRequireDefault(_colr),
                        _button = __webpack_require__(52),
                        _button2 = _interopRequireDefault(_button),
                        ColorButton = (__webpack_require__(8), function (props) {
                            var value = props.value,
                                onClick = props.onClick,
                                children = props.children,
                                color = _colr2["default"].fromHsvObject(value).toHex(),
                                style = {
                                    backgroundColor: color,
                                    width: "1em",
                                    height: "1em",
                                    marginBottom: "0.5em",
                                    marginRight: "0.5em",
                                    padding: "0.5em",
                                    display: "inline-block",
                                    ":hover": {
                                        backgroundColor: color
                                    }
                                };
                            return _preact2["default"].h(_button2["default"], _extends3["default"]({
                                label: ""
                            }, props, {
                                style: style,
                                value: onClick
                            }), children)
                        }),
                        Palette = function (_React$Component) {
                            function Palette() {
                                _classCallCheck3["default"](this, Palette);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(Palette).call(this));
                                return _this.state = {
                                    hover: null
                                }, _this
                            }
                            return _inherits3["default"](Palette, _React$Component), _createClass3["default"](Palette, [{
                                key: "render",
                                value: function () {
                                    var _this2 = this,
                                        _props = this.props,
                                        values = _props.values,
                                        onSelect = _props.onSelect,
                                        onDeselect = _props.onDeselect,
                                        hover = this.state.hover,
                                        areColoursRemoveable = void 0 !== onDeselect;
                                    return values && 0 !== values.length ? _preact2["default"].h("div", null, values.map(function (color, i) {
                                        return _preact2["default"].h(ColorButton, {
                                            key: i,
                                            value: color,
                                            onMouseOver: function (e) {
                                                return areColoursRemoveable && e.shiftKey ? _this2.setState({
                                                    hover: i
                                                }) : null
                                            },
                                            onMouseOut: areColoursRemoveable ? function () {
                                                return _this2.setState({
                                                    hover: null
                                                })
                                            } : null,
                                            onClick: function (e) {
                                                return e.shiftKey ? onDeselect(color, i) : onSelect(color)
                                            }
                                        }, i === hover ? _preact2["default"].h("div", null) : null)
                                    })) : null
                                }
                            }]), Palette
                        }(_preact2["default"].Component);
                    Palette.defaultProps = {
                        values: [],
                        onSelect: function (a) {
                            return a
                        }
                    }, Palette.propTypes = {
                        values: _proptypes2["default"].arrayOf(_proptypes2["default"].shape({
                            h: _proptypes2["default"].number.isRequired,
                            s: _proptypes2["default"].number.isRequired,
                            v: _proptypes2["default"].number.isRequired
                        })).isRequired,
                        onSelect: _proptypes2["default"].func,
                        onDeselect: _proptypes2["default"].func,
                        style: _proptypes2["default"].object
                    };
                    exports["default"] = Palette
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _styles = __webpack_require__(8),
                        defaultStyle = {
                            "float": "right",
                            ":focus": {
                                outline: "none"
                            }
                        },
                        ComboBox = function (_React$Component) {
                            function ComboBox() {
                                return _classCallCheck3["default"](this, ComboBox), _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(ComboBox).apply(this, arguments))
                            }
                            return _inherits3["default"](ComboBox, _React$Component), _createClass3["default"](ComboBox, [{
                                key: "render",
                                value: function () {
                                    var _props = this.props,
                                        label = _props.label,
                                        options = _props.options,
                                        value = _props.value,
                                        _onChange = _props.onChange,
                                        isArray = Array.isArray(options),
                                        valueSelected = !1,
                                        optionsElems = [],
                                        arrOptions = [];
                                    for (var i in options) {
                                        var element = void 0;
                                        arrOptions.push(options[i]), options[i] !== value || valueSelected ? element = _preact2["default"].h("option", {
                                            key: i,
                                            value: options[i]
                                        }, isArray ? options[i] : i) : (valueSelected = !0, element = _preact2["default"].h("option", {
                                            key: i,
                                            value: options[i],
                                            selected: !0
                                        }, isArray ? options[i] : i)), optionsElems.push(element)
                                    }
                                    return _preact2["default"].h("div", {
                                        style: _styles.base
                                    }, _preact2["default"].h("label", null, label), _preact2["default"].h("select", {
                                        onChange: function (e) {
                                            return _onChange(arrOptions[e.target.selectedIndex])
                                        },
                                        style: defaultStyle
                                    }, optionsElems))
                                }
                            }]), ComboBox
                        }(_preact2["default"].Component);
                    ComboBox.defaultProps = {
                        label: "ComboBox",
                        options: [],
                        onChange: function (a) {
                            return a
                        }
                    }, ComboBox.propTypes = {
                        label: _proptypes2["default"].any,
                        options: _proptypes2["default"].oneOfType([_proptypes2["default"].arrayOf(_proptypes2["default"].any).isRequired, _proptypes2["default"].objectOf(_proptypes2["default"].any).isRequired]),
                        value: _proptypes2["default"].any.isRequired,
                        onChange: _proptypes2["default"].func
                    }, exports["default"] = ComboBox
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.combobox = void 0;
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _combobox = __webpack_require__(82),
                        _combobox2 = _interopRequireDefault(_combobox),
                        _annotate = __webpack_require__(11),
                        _withChangeObject = __webpack_require__(28),
                        _withChangeObject2 = _interopRequireDefault(_withChangeObject),
                        control = _withChangeObject2["default"](_combobox2["default"]);
                    exports["default"] = control;
                    exports.combobox = function (options) {
                        return _annotate.annotate(_extends3["default"]({}, options, {
                            control: control
                        }))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _styles = __webpack_require__(8),
                        _expandLess = __webpack_require__(56),
                        _expandLess2 = _interopRequireDefault(_expandLess),
                        _expandMore = __webpack_require__(57),
                        _expandMore2 = _interopRequireDefault(_expandMore),
                        Folder = function (_Component) {
                            function Folder() {
                                _classCallCheck3["default"](this, Folder);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(Folder).call(this));
                                return _this.state = {
                                    open: !1
                                }, _this.toggleOpen = function () {
                                    return _this.setState({
                                        open: !_this.state.open
                                    })
                                }, _this
                            }
                            return _inherits3["default"](Folder, _Component), _createClass3["default"](Folder, [{
                                key: "componentWillMount",
                                value: function () {
                                    this.setState({
                                        open: this.props.open
                                    })
                                }
                            }, {
                                key: "render",
                                value: function () {
                                    var _props = this.props,
                                        label = _props.label,
                                        value = _props.value,
                                        open = (_props.style, this.state.open),
                                        Chevron = open ? _expandMore2["default"] : _expandLess2["default"];
                                    return _preact2["default"].h("div", {
                                        style: _styles.base
                                    }, _preact2["default"].h("div", {
                                        onClick: this.toggleOpen,
                                        style: {
                                            display: "flex",
                                            alignItems: "center"
                                        }
                                    }, _preact2["default"].h("label", null, label), _preact2["default"].h(Chevron, {
                                        style: {
                                            marginLeft: "auto"
                                        }
                                    })), open ? _preact2["default"].h("div", {
                                        style: {
                                            padding: "1em",
                                            backgroundColor: "rgba( 1, 1, 1, 0.04 )",
                                            borderRadius: 2
                                        }
                                    }, value()) : null)
                                }
                            }]), Folder
                        }(_preact.Component);
                    Folder.defaultProps = {
                        label: "Folder",
                        onChange: function (a) {
                            return a
                        },
                        open: !1
                    }, Folder.propTypes = {
                        value: _proptypes2["default"].func.isRequired,
                        onChange: _proptypes2["default"].func,
                        label: _proptypes2["default"].string,
                        style: _proptypes2["default"].object
                    };
                    exports["default"] = Folder
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _folder = __webpack_require__(84),
                        _folder2 = _interopRequireDefault(_folder);
                    exports["default"] = _folder2["default"]
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _toConsumableArray2 = __webpack_require__(110),
                        _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _preactSvg = __webpack_require__(21),
                        _preactSvg2 = _interopRequireDefault(_preactSvg),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _styles = __webpack_require__(8),
                        _math = __webpack_require__(22),
                        _warning = __webpack_require__(93),
                        _warning2 = _interopRequireDefault(_warning),
                        defaultStyle = {
                            nonScalingStroke: {
                                vectorEffect: "non-scaling-stroke",
                                shapeRendering: "geometricPrecision"
                            },
                            rect: {
                                fill: "none",
                                strokeWidth: 1,
                                stroke: _styles.secondary.color
                            }
                        },
                        Graph = function (_React$Component) {
                            function Graph() {
                                return _classCallCheck3["default"](this, Graph), _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(Graph).apply(this, arguments))
                            }
                            return _inherits3["default"](Graph, _React$Component), _createClass3["default"](Graph, [{
                                key: "render",
                                value: function () {
                                    var _props = this.props,
                                        value = _props.value,
                                        label = _props.label,
                                        style = _props.style,
                                        min = _props.min,
                                        max = _props.max,
                                        fill = _props.fill;
                                    _warning2["default"](value.length <= 1, "warning: The `graph` component expects and array of more than 1 number. Any less will result in an empty graph."), min = void 0 !== min ? min : Math.min.apply(Math, _toConsumableArray3["default"](value)), max = void 0 !== max ? max : Math.max.apply(Math, _toConsumableArray3["default"](value));
                                    for (var value2D = [], length = value.length, n = void 0, interval = 100 / (length - 1), i = 0; length > i; i++) n = value[i], value2D.push(String(i * interval)), value2D.push(String(_math.map(n, min, max, 100, 0)));
                                    return fill && (value2D = ["0", "100"].concat(value2D, ["100", "100"])), _preact2["default"].h("div", {
                                        style: _styles.base
                                    }, label, _preact2["default"].h("div", {
                                        style: style
                                    }, _preact2["default"].h(_preactSvg2["default"], {
                                        style: _extends3["default"]({}, _styles.base, {
                                            display: "block"
                                        }),
                                        width: "100%",
                                        height: "100%",
                                        viewBox: "0 0 100 100",
                                        preserveAspectRatio: "none"
                                    }, _preact2["default"].h("rect", {
                                        style: _extends3["default"]({}, defaultStyle.rect, defaultStyle.nonScalingStroke),
                                        fill: "rgb( 250, 250, 250 )",
                                        width: "100%",
                                        height: "100%"
                                    }), max > min ? _preact2["default"].h("polyline", {
                                        style: defaultStyle.nonScalingStroke,
                                        fill: fill ? _styles.highlight.color : "none",
                                        stroke: _styles.highlight.color,
                                        points: value2D
                                    }) : null)))
                                }
                            }]), Graph
                        }(_preact2["default"].Component),
                        arrayLikeStructures = [_proptypes2["default"].arrayOf(_proptypes2["default"].number), _proptypes2["default"].instanceOf(Int8Array), _proptypes2["default"].instanceOf(Uint8Array), _proptypes2["default"].instanceOf(Uint8ClampedArray), _proptypes2["default"].instanceOf(Int16Array), _proptypes2["default"].instanceOf(Uint16Array), _proptypes2["default"].instanceOf(Int32Array), _proptypes2["default"].instanceOf(Uint32Array), _proptypes2["default"].instanceOf(Float32Array), _proptypes2["default"].instanceOf(Float64Array)];
                    Graph.propTypes = {
                        label: _proptypes2["default"].string,
                        value: _proptypes2["default"].oneOfType(arrayLikeStructures).isRequired,
                        min: _proptypes2["default"].number,
                        max: _proptypes2["default"].number,
                        fill: _proptypes2["default"].bool,
                        style: _proptypes2["default"].object
                    }, Graph.defaultProps = {
                        fill: !1,
                        label: "Graph",
                        value: [],
                        style: {
                            width: "100%",
                            height: 150
                        }
                    }, exports["default"] = Graph
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.graph = void 0;
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _graph = __webpack_require__(86),
                        _graph2 = _interopRequireDefault(_graph),
                        _annotate = __webpack_require__(11);
                    exports["default"] = _graph2["default"];
                    exports.graph = function (options) {
                        return _annotate.annotate(_extends3["default"]({}, options, {
                            control: _graph2["default"]
                        }))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _math = __webpack_require__(22),
                        _styles = __webpack_require__(8),
                        _shallowCompare = __webpack_require__(35),
                        _shallowCompare2 = _interopRequireDefault(_shallowCompare),
                        NumericStepper = function (_React$Component) {
                            function NumericStepper() {
                                return _classCallCheck3["default"](this, NumericStepper), _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(NumericStepper).apply(this, arguments))
                            }
                            return _inherits3["default"](NumericStepper, _React$Component), _createClass3["default"](NumericStepper, [{
                                key: "shouldComponentUpdate",
                                value: function (nextProps, nextState) {
                                    return _shallowCompare2["default"](this, nextProps, nextState)
                                }
                            }, {
                                key: "render",
                                value: function () {
                                    var _this2 = this,
                                        _props = this.props,
                                        label = _props.label,
                                        min = _props.min,
                                        max = _props.max,
                                        step = _props.step,
                                        style = _props.style,
                                        validate = function (v) {
                                            return Math.round(_math.clamp(v, min, max) * (1 / step)) / (1 / step)
                                        },
                                        value = validate(this.props.value),
                                        onChange = function (e) {
                                            e.preventDefault();
                                            var value = parseFloat(e.currentTarget.value);
                                            isNaN(value) || _this2.props.onChange(validate(value))
                                        };
                                    return _preact2["default"].h("div", {
                                        style: _extends3["default"]({}, _styles.base, {
                                            display: "flex",
                                            alignItems: "baseline"
                                        }, style)
                                    }, _preact2["default"].h("label", null, label), _preact2["default"].h("style", null, "\n                input[type=number] {\n                    -moz-appearance:textfield;\n                }\n\n                input::-webkit-inner-spin-button,\n                input::-webkit-outer-spin-button{\n                    margin: 0;\n                    -webkit-appearance: none;\n                }\n            "), _preact2["default"].h("input", _extends3["default"]({
                                        type: "number"
                                    }, this.props, {
                                        style: defaultStyle,
                                        value: value,
                                        onInput: onChange,
                                        onChange: onChange,
                                        ref: function (_ref) {
                                            return _this2.domRef = _ref
                                        }
                                    })))
                                }
                            }]), NumericStepper
                        }(_preact2["default"].Component);
                    NumericStepper.propTypes = {
                        label: _proptypes2["default"].string,
                        value: _proptypes2["default"].number.isRequired,
                        min: _proptypes2["default"].number,
                        max: _proptypes2["default"].number,
                        step: _proptypes2["default"].number,
                        onChange: _proptypes2["default"].func,
                        style: _proptypes2["default"].object
                    }, NumericStepper.defaultProps = {
                        label: "NumericStepper",
                        min: 0,
                        max: 100,
                        style: {
                            width: "100%"
                        },
                        step: .1,
                        onChange: function (a) {
                            return a
                        }
                    };
                    var defaultStyle = {
                        fontFamily: "inherit",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: _styles.secondary.color,
                        borderRadius: 2,
                        backgroundColor: "transparent",
                        outline: "none",
                        textAlign: "center",
                        width: 30,
                        fontSize: _styles.base.fontSize,
                        color: _styles.base.color,
                        marginLeft: "auto",
                        ":focus": {
                            borderColor: _styles.highlight.color
                        },
                        ":hover": {
                            borderColor: _styles.highlight.color
                        }
                    };
                    exports["default"] = NumericStepper
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _panel = __webpack_require__(90),
                        _panel2 = _interopRequireDefault(_panel);
                    exports["default"] = _panel2["default"]
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _styles = (_interopRequireDefault(_proptypes), __webpack_require__(8)),
                        _expandLess = __webpack_require__(56),
                        _expandLess2 = _interopRequireDefault(_expandLess),
                        _expandMore = __webpack_require__(57),
                        _expandMore2 = _interopRequireDefault(_expandMore),
                        Panel = function (_React$Component) {
                            function Panel() {
                                _classCallCheck3["default"](this, Panel);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(Panel).call(this));
                                return _this.state = {
                                    open: !0
                                }, _this.toggleOpen = function () {
                                    return _this.setState({
                                        open: !_this.state.open
                                    })
                                }, _this
                            }
                            return _inherits3["default"](Panel, _React$Component), _createClass3["default"](Panel, [{
                                key: "componentWillMount",
                                value: function () {
                                    this.setState({
                                        open: this.props.open
                                    })
                                }
                            }, {
                                key: "render",
                                value: function () {
                                    var _props = this.props,
                                        children = _props.children,
                                        label = _props.label,
                                        open = this.state.open,
                                        Chevron = open ? _expandMore2["default"] : _expandLess2["default"];
                                    return _preact2["default"].h("div", {
                                        style: _extends3["default"]({}, _styles.base, style),
                                        "class": "oui-panel"
                                    }, _preact2["default"].h("header", {
                                        style: {
                                            lineHeight: "11px"
                                        },
                                        onClick: this.toggleOpen
                                    }, _preact2["default"].h("div", {
                                        style: {
                                            display: "flex"
                                        }
                                    }, _preact2["default"].h("label", null, label), _preact2["default"].h(Chevron, {
                                        style: {
                                            marginLeft: "auto"
                                        }
                                    })), open ? _preact2["default"].h("hr", {
                                        style: lineStyle
                                    }) : null), open ? _preact2["default"].h("div", null, children) : null)
                                }
                            }]), Panel
                        }(_preact2["default"].Component);
                    Panel.defaultProps = {
                        label: "Panel",
                        open: !0
                    };
                    var lineStyle = {
                            borderWidth: "0px 0px 1px 0px",
                            borderTopStyle: "solid",
                            borderRightStyle: "solid",
                            borderLeftStyle: "solid",
                            borderTopColor: _styles.secondary.color,
                            borderRightColor: _styles.secondary.color,
                            borderLeftColor: _styles.secondary.color,
                            borderBottomColor: "rgba( 1, 1, 1, 0.05 )"
                        },
                        style = {
                            boxSizing: "border-box",
                            lineHeight: "2em",
                            display: "flex",
                            flexDirection: "column",
                            width: 275,
                            background: "rgb( 250, 250, 250 )",
                            borderRadius: 2,
                            padding: "1em",
                            margin: 0
                        };
                    exports["default"] = Panel
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _defineProperty2 = __webpack_require__(61),
                        _defineProperty3 = _interopRequireDefault(_defineProperty2),
                        _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _preactSvg = __webpack_require__(21),
                        _preactSvg2 = _interopRequireDefault(_preactSvg),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _numericstepper = __webpack_require__(33),
                        _numericstepper2 = _interopRequireDefault(_numericstepper),
                        _shallowCompare = __webpack_require__(35),
                        _shallowCompare2 = _interopRequireDefault(_shallowCompare),
                        _math = __webpack_require__(22),
                        _throttle = __webpack_require__(34),
                        _throttle2 = _interopRequireDefault(_throttle),
                        _styles = __webpack_require__(8),
                        Slider = function (_React$Component) {
                            function Slider() {
                                _classCallCheck3["default"](this, Slider);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(Slider).call(this));
                                _this.state = {
                                    drag: !1,
                                    rect: null
                                }, _this.validate = function (value) {
                                    var _this$props = _this.props,
                                        min = (_this$props.onChange, _this$props.min),
                                        max = _this$props.max,
                                        step = _this$props.step;
                                    return value = _math.clamp(value, min, max), value = Math.round(value * (1 / step)) / (1 / step)
                                }, _this.onNumericStepperChange = function (value) {
                                    _this.props.onChange(_this.validate(value))
                                };
                                var computeValuefromMouseEvent = function (e, bounds) {
                                    return _math.map(void 0 === e.clientX ? e.touches[0].clientX : e.clientX, bounds.left, bounds.right, _this.props.min, _this.props.max)
                                };
                                return _this.onMouseDown = function (e) {
                                    e.preventDefault();
                                    var _this$props2 = _this.props,
                                        min = (_this$props2.value, _this$props2.min),
                                        max = _this$props2.max,
                                        step = _this$props2.step,
                                        onChange = _this$props2.onChange,
                                        validate = function (v) {
                                            return Math.round(_math.clamp(v, min, max) * (1 / step)) / (1 / step)
                                        },
                                        rect = e.currentTarget.getBoundingClientRect();
                                    _this.setState({
                                        drag: !0,
                                        rect: rect
                                    }), onChange(validate(computeValuefromMouseEvent(e, rect)))
                                }, _this.onMouseMove = _throttle2["default"](function (e) {
                                    var _this$props3 = _this.props,
                                        min = (_this$props3.value, _this$props3.min),
                                        max = _this$props3.max,
                                        step = _this$props3.step,
                                        onChange = _this$props3.onChange,
                                        validate = function (v) {
                                            return Math.round(_math.clamp(v, min, max) * (1 / step)) / (1 / step)
                                        };
                                    onChange(validate(computeValuefromMouseEvent(e, _this.state.rect)))
                                }), _this.onTouchMove = _throttle2["default"](function (e) {
                                    e.preventDefault();
                                    var _this$props4 = _this.props,
                                        min = (_this$props4.value, _this$props4.min),
                                        max = _this$props4.max,
                                        step = _this$props4.step,
                                        onChange = _this$props4.onChange,
                                        validate = function (v) {
                                            return Math.round(_math.clamp(v, min, max) * (1 / step)) / (1 / step)
                                        };
                                    onChange(validate(computeValuefromMouseEvent(e, _this.state.rect)))
                                }), _this.onMouseUp = function () {
                                    _this.setState({
                                        drag: !1
                                    })
                                }, _this
                            }
                            return _inherits3["default"](Slider, _React$Component), _createClass3["default"](Slider, [{
                                key: "shouldComponentUpdate",
                                value: function (nextProps, nextState) {
                                    return _shallowCompare2["default"](this, nextProps, nextState)
                                }
                            }, {
                                key: "componentDidUpdate",
                                value: function (props, state) {
                                    this.state.drag && !state.drag ? (document.addEventListener("mousemove", this.onMouseMove), document.addEventListener("mouseup", this.onMouseUp), document.addEventListener("touchmove", this.onTouchMove), document.addEventListener("touchend", this.onMouseUp)) : !this.state.drag && state.drag && (document.removeEventListener("mousemove", this.onMouseMove), document.removeEventListener("mouseup", this.onMouseUp), document.removeEventListener("touchmove", this.onTouchMove), document.removeEventListener("touchend", this.onMouseUp))
                                }
                            }, {
                                key: "render",
                                value: function () {
                                    var _props = this.props,
                                        value = _props.value,
                                        label = _props.label,
                                        min = _props.min,
                                        max = _props.max,
                                        step = _props.step,
                                        onChange = _props.onChange,
                                        includeStepper = _props.includeStepper,
                                        style = _props.style,
                                        stepperProps = {
                                            value: value,
                                            label: label,
                                            min: min,
                                            max: max,
                                            step: step,
                                            onChange: onChange
                                        },
                                        offsetPercentage = _math.map(_math.clamp(value, min, max), min, max, 0, 100) + "%";
                                    return value = this.validate(value), _preact2["default"].h("div", {
                                        style: _styles.base
                                    }, includeStepper ? _preact2["default"].h(_numericstepper2["default"], _extends3["default"]({}, stepperProps, {
                                        onChange: this.onNumericStepperChange
                                    })) : null, _preact2["default"].h(_preactSvg2["default"], {
                                        width: "100%",
                                        height: "1em",
                                        style: defaultStyle,
                                        onMouseDown: this.onMouseDown,
                                        onTouchStart: this.onMouseDown
                                    }, _preact2["default"].h("rect", {
                                        width: "100%",
                                        height: "100%",
                                        style: _extends3["default"]({}, defaultStyle, backgroundBar, style.backgroundBar)
                                    }), _preact2["default"].h("rect", _defineProperty3["default"]({
                                        width: "100%",
                                        height: "100%",
                                        style: _extends3["default"]({}, defaultStyle, bar, style.bar)
                                    }, "width", offsetPercentage)), _preact2["default"].h("circle", {
                                        cy: "50%",
                                        cx: offsetPercentage,
                                        r: "0.5em",
                                        style: _extends3["default"]({}, defaultStyle, thumb, style.thumb)
                                    })))
                                }
                            }]), Slider
                        }(_preact2["default"].Component);
                    Slider.propTypes = {
                        label: _proptypes2["default"].string,
                        value: _proptypes2["default"].number.isRequired,
                        min: _proptypes2["default"].number,
                        max: _proptypes2["default"].number,
                        step: _proptypes2["default"].number,
                        onChange: _proptypes2["default"].func,
                        includeStepper: _proptypes2["default"].bool,
                        style: _proptypes2["default"].object
                    }, Slider.defaultProps = {
                        label: "Slider",
                        includeStepper: !0,
                        min: 0,
                        max: 100,
                        step: 1,
                        onChange: function (a) {
                            return a
                        },
                        style: {
                            width: "100%"
                        }
                    };
                    var defaultStyle = {
                            display: "block",
                            overflow: "visible",
                            cursor: "default",
                            stroke: "none",
                            rx: 2,
                            ry: 2
                        },
                        thumb = {
                            fill: "none"
                        },
                        backgroundBar = {
                            fill: _styles.secondary.color
                        },
                        bar = {
                            fill: _styles.highlight.color
                        };
                    exports["default"] = Slider
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _styles = __webpack_require__(8),
                        TextInput = function (_React$Component) {
                            function TextInput() {
                                return _classCallCheck3["default"](this, TextInput), _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(TextInput).apply(this, arguments))
                            }
                            return _inherits3["default"](TextInput, _React$Component), _createClass3["default"](TextInput, [{
                                key: "render",
                                value: function () {
                                    var _props = this.props,
                                        value = _props.value,
                                        label = _props.label,
                                        onChange = _props.onChange,
                                        style = _props.style,
                                        pattern = _props.pattern,
                                        onSubmit = _props.onSubmit;
                                    return _preact2["default"].h("div", {
                                        style: _extends3["default"]({}, _styles.base, style, {
                                            display: "flex"
                                        })
                                    }, _preact2["default"].h("label", null, label), _preact2["default"].h("input", {
                                        type: "text",
                                        value: value,
                                        style: _extends3["default"]({}, defaultStyle),
                                        maxLength: "6",
                                        onInput: function (evt) {
                                            pattern.test(evt.target.value) && onChange(evt.target.value)
                                        },
                                        onChange: function (evt) {
                                            pattern.test(evt.target.value) && onSubmit(evt.target.value)
                                        }
                                    }))
                                }
                            }]), TextInput
                        }(_preact2["default"].Component);
                    TextInput.propTypes = {
                        value: _proptypes2["default"].string,
                        onChange: _proptypes2["default"].func,
                        onSubmit: _proptypes2["default"].func,
                        label: _proptypes2["default"].string,
                        style: _proptypes2["default"].object,
                        pattern: _proptypes2["default"].object
                    }, TextInput.defaultProps = {
                        value: "",
                        style: {
                            width: "100%"
                        },
                        label: "Text Input",
                        onChange: function (a) {
                            return a
                        },
                        onSubmit: function (a) {
                            return a
                        },
                        pattern: /.*/
                    };
                    var defaultStyle = {
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        color: "inherit",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderRadius: "none",
                        marginLeft: "auto",
                        textAlign: "right",
                        borderBottom: "1px solid " + _styles.secondary.color,
                        backgroundColor: "transparent",
                        ":focus": {
                            outline: "none",
                            borderBottom: "1px solid " + _styles.highlight.color
                        },
                        ":hover": {
                            borderBottom: "1px solid " + _styles.highlight.color
                        }
                    };
                    exports["default"] = TextInput
                }, function (module, exports) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports["default"] = function (condition, message) {
                        condition && "undefined" != typeof console && console.warn(message)
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _renderTree = __webpack_require__(59),
                        _renderTree2 = _interopRequireDefault(_renderTree),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes);
                    exports["default"] = function (FolderComponent) {
                        var WrappedComponent = function (_FolderComponent) {
                            function WrappedComponent() {
                                _classCallCheck3["default"](this, WrappedComponent);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(WrappedComponent).call(this));
                                return _this.tree = function () {
                                    return _renderTree2["default"](_this.props.value, _this.props.onChange)
                                }, _this
                            }
                            return _inherits3["default"](WrappedComponent, _FolderComponent), _createClass3["default"](WrappedComponent, [{
                                key: "render",
                                value: function () {
                                    return _preact2["default"].h(FolderComponent, _extends3["default"]({}, this.props, {
                                        value: this.tree
                                    }))
                                }
                            }]), WrappedComponent
                        }(FolderComponent);
                        return WrappedComponent.propTypes = {
                            value: _proptypes2["default"].oneOfType([_proptypes2["default"].object, _proptypes2["default"].array]).isRequired,
                            onChange: _proptypes2["default"].func,
                            label: _proptypes2["default"].string,
                            style: _proptypes2["default"].object
                        }, WrappedComponent
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.xypad = void 0;
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _xypad = __webpack_require__(96),
                        _xypad2 = _interopRequireDefault(_xypad),
                        _annotate = __webpack_require__(11),
                        _withChangeObject = __webpack_require__(28),
                        _withChangeObject2 = _interopRequireDefault(_withChangeObject),
                        control = _withChangeObject2["default"](_xypad2["default"]);
                    exports["default"] = control;
                    exports.xypad = function (options) {
                        return _annotate.annotate(_extends3["default"]({}, options, {
                            control: control
                        }))
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _classCallCheck2 = __webpack_require__(3),
                        _classCallCheck3 = _interopRequireDefault(_classCallCheck2),
                        _createClass2 = __webpack_require__(4),
                        _createClass3 = _interopRequireDefault(_createClass2),
                        _possibleConstructorReturn2 = __webpack_require__(6),
                        _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2),
                        _inherits2 = __webpack_require__(5),
                        _inherits3 = _interopRequireDefault(_inherits2),
                        _preact = __webpack_require__(2),
                        _preact2 = _interopRequireDefault(_preact),
                        _preactSvg = __webpack_require__(21),
                        _preactSvg2 = _interopRequireDefault(_preactSvg),
                        _proptypes = __webpack_require__(7),
                        _proptypes2 = _interopRequireDefault(_proptypes),
                        _numericstepper = __webpack_require__(33),
                        _numericstepper2 = _interopRequireDefault(_numericstepper),
                        _math = __webpack_require__(22),
                        _throttle = __webpack_require__(34),
                        _throttle2 = _interopRequireDefault(_throttle),
                        _styles = __webpack_require__(8),
                        XYPad = function (_React$Component) {
                            function XYPad() {
                                _classCallCheck3["default"](this, XYPad);
                                var _this = _possibleConstructorReturn3["default"](this, Object.getPrototypeOf(XYPad).call(this));
                                _this.state = {
                                    drag: !1,
                                    open: !0
                                };
                                var computeXYfromMouseEvent = function (e, bounds) {
                                    return {
                                        x: _math.map(void 0 === e.clientX ? e.touches[0].clientX : e.clientX, bounds.left, bounds.right, _this.props.min.x, _this.props.max.x),
                                        y: _math.map(void 0 === e.clientY ? e.touches[0].clientY : e.clientY, bounds.top, bounds.bottom, _this.props.min.y, _this.props.max.y)
                                    }
                                };
                                return _this.onMouseDown = function (e) {
                                    var rect = e.currentTarget.getBoundingClientRect();
                                    _this.setState({
                                        drag: !0,
                                        rect: rect
                                    }), _this.props.onChange(computeXYfromMouseEvent(e, rect))
                                }, _this.onMouseMove = _throttle2["default"](function (e) {
                                    _this.state.drag && _this.props.onChange(computeXYfromMouseEvent(e, _this.state.rect))
                                }), _this.onTouchMove = function (e) {
                                    e.preventDefault(), _this.state.drag && _this.props.onChange(computeXYfromMouseEvent(e, _this.state.rect))
                                }, _this.onMouseUp = function () {
                                    _this.setState({
                                        drag: !1
                                    })
                                }, _this.onXChange = function (x) {
                                    return _this.props.onChange(_extends3["default"]({}, _this.props.value, {
                                        x: x
                                    }))
                                }, _this.onYChange = function (y) {
                                    return _this.props.onChange(_extends3["default"]({}, _this.props.value, {
                                        y: y
                                    }))
                                }, _this
                            }
                            return _inherits3["default"](XYPad, _React$Component), _createClass3["default"](XYPad, [{
                                key: "render",
                                value: function () {
                                    var _this2 = this,
                                        _props = this.props,
                                        value = _props.value,
                                        label = _props.label,
                                        style = (_props.onChange, _props.style),
                                        open = this.state.open,
                                        x = value.x,
                                        y = value.y,
                                        min = _extends3["default"]({}, this.props.min, XYPad.min),
                                        max = _extends3["default"]({}, this.props.max, XYPad.max),
                                        xVis = _math.map(x, min.x, max.x, 0, 100) + "%",
                                        yVis = _math.map(y, min.y, max.y, 0, 100) + "%";
                                    return _preact2["default"].h("div", {
                                        style: _extends3["default"]({}, _styles.base, {
                                            height: "auto"
                                        })
                                    }, _preact2["default"].h("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center"
                                        }
                                    }, _preact2["default"].h("label", {
                                        onClick: function () {
                                            return _this2.setState({
                                                open: !open
                                            })
                                        }
                                    }, label), _preact2["default"].h("div", {
                                        style: {
                                            display: "flex",
                                            marginLeft: "auto"
                                        }
                                    }, _preact2["default"].h(_numericstepper2["default"], {
                                        style: componentLabels,
                                        min: min.x,
                                        max: max.x,
                                        value: x,
                                        onChange: this.onXChange,
                                        label: "X"
                                    }), _preact2["default"].h(_numericstepper2["default"], {
                                        style: componentLabels,
                                        min: min.y,
                                        max: max.y,
                                        value: y,
                                        onChange: this.onYChange,
                                        label: "Y"
                                    }))), open ? _preact2["default"].h(_preactSvg2["default"], {
                                        width: "100%",
                                        height: "100%",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        style: _extends3["default"]({}, defaultStyle, style),
                                        ref: function (_ref) {
                                            return _this2.domRef = _ref
                                        },
                                        onMouseDown: this.onMouseDown,
                                        onMouseMove: this.state.drag ? this.onMouseMove : null,
                                        onMouseUp: this.onMouseUp,
                                        onTouchStart: this.onMouseDown,
                                        onTouchMove: this.onTouchMove,
                                        onTouchEnd: this.onMouseUp
                                    }, _preact2["default"].h("rect", {
                                        fill: "rgb( 250, 250, 250 )",
                                        stroke: _styles.secondary.color,
                                        "stroke-width": "1",
                                        width: "100%",
                                        height: "100%"
                                    }), _preact2["default"].h("line", {
                                        x1: xVis,
                                        x2: xVis,
                                        y1: 0,
                                        y2: "100%",
                                        style: _extends3["default"]({}, defaultStyle, style, crisp)
                                    }), _preact2["default"].h("line", {
                                        x1: 0,
                                        x2: "100%",
                                        y1: yVis,
                                        y2: yVis,
                                        style: _extends3["default"]({}, defaultStyle, style, crisp)
                                    }), _preact2["default"].h("circle", {
                                        r: 3,
                                        cx: xVis,
                                        cy: yVis,
                                        style: circle
                                    })) : null)
                                }
                            }]), XYPad
                        }(_preact2["default"].Component);
                    XYPad.propTypes = {
                        label: _proptypes2["default"].string,
                        value: _proptypes2["default"].shape({
                            x: _proptypes2["default"].number.isRequired,
                            y: _proptypes2["default"].number.isRequired
                        }).isRequired,
                        min: _proptypes2["default"].shape({
                            x: _proptypes2["default"].number,
                            y: _proptypes2["default"].number
                        }),
                        max: _proptypes2["default"].shape({
                            x: _proptypes2["default"].number,
                            y: _proptypes2["default"].number
                        }),
                        onChange: _proptypes2["default"].func,
                        style: _proptypes2["default"].object
                    }, XYPad.defaultProps = {
                        label: "XYPad",
                        style: {
                            width: "100%",
                            height: 150
                        },
                        min: {
                            x: 0,
                            y: 0
                        },
                        max: {
                            x: 100,
                            y: 100
                        },
                        onChange: function (a) {
                            return a
                        }
                    };
                    var defaultStyle = {
                            display: "block",
                            cursor: "default",
                            stroke: _styles.secondary.color,
                            strokeWidth: 1
                        },
                        crisp = {
                            shapeRendering: "crispEdges"
                        },
                        circle = {
                            fill: _styles.secondary.color,
                            stroke: "none"
                        },
                        componentLabels = {
                            display: "inline"
                        };
                    exports["default"] = XYPad
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _extends2 = __webpack_require__(1),
                        _extends3 = _interopRequireDefault(_extends2),
                        _imperativeApi = __webpack_require__(58),
                        _imperativeApi2 = _interopRequireDefault(_imperativeApi),
                        _annotate = __webpack_require__(11),
                        _add = function (obj, propName) {
                            var annotation = arguments.length <= 2 || void 0 === arguments[2] ? {} : arguments[2],
                                target = arguments[3];
                            _annotate.setAnnotation(target, target.length, _extends3["default"]({
                                label: propName
                            }, annotation)), Object.defineProperty(target, target.length, {
                                get: function () {
                                    return obj[propName]
                                },
                                set: function (v) {
                                    return obj[propName] = v
                                },
                                enumerable: !0,
                                configurable: !0
                            })
                        },
                        _addFolder = function _addFolder(target) {
                            return {
                                add: function (obj, propName, annotation) {
                                    return _add(obj, propName, annotation, target)
                                },
                                addFolder: function (annotation) {
                                    var api = [];
                                    return _annotate.setAnnotation(target, target.push(api) - 1, _extends3["default"]({
                                        label: "folder"
                                    }, annotation)), _addFolder(api)
                                }
                            }
                        };
                    exports["default"] = function (opts, callback) {
                        var api = [],
                            p = _imperativeApi2["default"](opts),
                            draw = function draw() {
                                p(api, callback), requestAnimationFrame(draw)
                            };
                        return draw(), _addFolder(api)
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _typeof2 = __webpack_require__(18),
                        _typeof3 = _interopRequireDefault(_typeof2),
                        _warn = __webpack_require__(29),
                        _warn2 = _interopRequireDefault(_warn),
                        isWritable = function (obj, prop) {
                            var propDesc = Object.getOwnPropertyDescriptor(obj, prop);
                            return propDesc ? propDesc.writable === !0 || void 0 !== propDesc.set : !0
                        },
                        deepmerge = function deepmerge(a, b) {
                            var isFrozen = Object.isFrozen(a) || !Object.isExtensible(a);
                            if (_warn2["default"](isFrozen, "The merge target is frozen and cannot be mutated"), isFrozen) return a;
                            var breakOn = Array.isArray(a) && b.length,
                                index = 0;
                            for (var prop in b) {
                                if ("object" === _typeof3["default"](a[prop])) {
                                    var _isFrozen = Object.isFrozen(a[prop]);
                                    _warn2["default"](_isFrozen, "The property `" + prop + "` is frozen and cannot be mutated."), _isFrozen || deepmerge(a[prop], b[prop])
                                } else {
                                    var writable = isWritable(a, prop);
                                    _warn2["default"](!writable, "The property `" + prop + "` is not writable and cannot be mutated."), writable && (a[prop] = b[prop])
                                }
                                breakOn === ++index && a.splice(breakOn)
                            }
                            return a
                        };
                    exports["default"] = deepmerge
                }, function (module, exports) {
                    "use strict";
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var element = document.createElement("div");
                    element.className = "oui", element.style.position = "absolute", element.style.right = "0", element.style.top = "0", element.style.padding = "0.25em", element.style.display = "flex", element.style.flexDirection = "column", element.style.flexWrap = "wrap", element.style.alignItems = "flex-start", element.style.alignContent = "flex-start", exports["default"] = element
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _imperativeApi = __webpack_require__(58),
                        _imperativeApi2 = _interopRequireDefault(_imperativeApi),
                        _annotate = __webpack_require__(11),
                        _datoui = __webpack_require__(97),
                        _datoui2 = _interopRequireDefault(_datoui),
                        _colorpicker = __webpack_require__(80),
                        _colorpicker2 = _interopRequireDefault(_colorpicker),
                        _combobox = __webpack_require__(83),
                        _combobox2 = _interopRequireDefault(_combobox),
                        _graph = __webpack_require__(87),
                        _graph2 = _interopRequireDefault(_graph),
                        _xypad = __webpack_require__(95),
                        _xypad2 = _interopRequireDefault(_xypad),
                        oui = _imperativeApi2["default"]({
                            label: "Master"
                        }),
                        controls = {
                            ColorPicker: _colorpicker2["default"],
                            ComboBox: _combobox2["default"],
                            Graph: _graph2["default"],
                            XYPad: _xypad2["default"]
                        };
                    exports["default"] = {
                        oui: oui,
                        panel: _imperativeApi2["default"],
                        datoui: _datoui2["default"],
                        annotate: _annotate.annotate,
                        color: _colorpicker.color,
                        combobox: _combobox.combobox,
                        graph: _graph.graph,
                        xypad: _xypad.xypad,
                        controls: controls
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _slider = __webpack_require__(54),
                        _slider2 = _interopRequireDefault(_slider),
                        _checkbox = __webpack_require__(75),
                        _checkbox2 = _interopRequireDefault(_checkbox),
                        _textinput = __webpack_require__(55),
                        _textinput2 = _interopRequireDefault(_textinput),
                        _folder = __webpack_require__(85),
                        _folder2 = _interopRequireDefault(_folder),
                        _button = __webpack_require__(52),
                        _button2 = _interopRequireDefault(_button),
                        _withChangeObject = __webpack_require__(28),
                        _withChangeObject2 = _interopRequireDefault(_withChangeObject),
                        _withTree = __webpack_require__(94),
                        _withTree2 = _interopRequireDefault(_withTree);
                    exports["default"] = new Map([
                        ["function", _button2["default"]],
                        ["number", _withChangeObject2["default"](_slider2["default"])],
                        ["string", _withChangeObject2["default"](_textinput2["default"])],
                        ["boolean", _withChangeObject2["default"](_checkbox2["default"])],
                        ["object", _withChangeObject2["default"](_withTree2["default"](_folder2["default"]))]
                    ])
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }

                    function is(x, y) {
                        return x === y ? 0 !== x || 1 / x === 1 / y : x !== x && y !== y
                    }

                    function shallowEqual(objA, objB) {
                        if (is(objA, objB)) return !0;
                        if ("object" !== ("undefined" == typeof objA ? "undefined" : _typeof3["default"](objA)) || null === objA || "object" !== ("undefined" == typeof objB ? "undefined" : _typeof3["default"](objB)) || null === objB) return !1;
                        var keysA = Object.keys(objA),
                            keysB = Object.keys(objB);
                        if (keysA.length !== keysB.length) return !1;
                        for (var i = 0; i < keysA.length; i++)
                            if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) return !1;
                        return !0
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    });
                    var _typeof2 = __webpack_require__(18),
                        _typeof3 = _interopRequireDefault(_typeof2),
                        hasOwnProperty = Object.prototype.hasOwnProperty;
                    exports["default"] = shallowEqual
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    Object.defineProperty(exports, "__esModule", {
                        value: !0
                    }), exports.isValidControl = exports.validateProp = void 0; {
                        var _typeof2 = __webpack_require__(18),
                            _typeof3 = _interopRequireDefault(_typeof2),
                            _warn = __webpack_require__(29),
                            _warn2 = _interopRequireDefault(_warn),
                            _preact = __webpack_require__(2),
                            _preact2 = _interopRequireDefault(_preact);
                        exports.validateProp = function (prop, propName, Comp) {
                            var name = Comp.displayName || Comp.name,
                                err = Comp.propTypes.value(prop, propName, name, "prop");
                            _warn2["default"](err, err ? err.message : "")
                        }, exports.isValidControl = function (Control) {
                            return _preact2["default"].isValidElement(_preact2["default"].createElement(Control, null)) && Control.propTypes && "object" === _typeof3["default"](Control.propTypes) && "function" == typeof Control.propTypes.value
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = {
                        "default": __webpack_require__(112),
                        __esModule: !0
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = {
                        "default": __webpack_require__(113),
                        __esModule: !0
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = {
                        "default": __webpack_require__(114),
                        __esModule: !0
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = {
                        "default": __webpack_require__(116),
                        __esModule: !0
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = {
                        "default": __webpack_require__(117),
                        __esModule: !0
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = {
                        "default": __webpack_require__(118),
                        __esModule: !0
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";

                    function _interopRequireDefault(obj) {
                        return obj && obj.__esModule ? obj : {
                            "default": obj
                        }
                    }
                    exports.__esModule = !0;
                    var _from = __webpack_require__(104),
                        _from2 = _interopRequireDefault(_from);
                    exports["default"] = function (arr) {
                        if (Array.isArray(arr)) {
                            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                            return arr2
                        }
                        return _from2["default"](arr)
                    }
                }, function (module) {
                    "use strict";

                    function hexVal(c) {
                        return 58 > c ? c - 48 : 71 > c ? c - 55 : c - 87
                    }

                    function hex2rgb(hex) {
                        var i = "#" === hex[0] ? 1 : 0,
                            len = hex.length;
                        if (3 > len - i) throw new Error("hex input must be at least three chars long");
                        var r, g, b, h1 = hexVal(hex.charCodeAt(0 + i)),
                            h2 = hexVal(hex.charCodeAt(1 + i)),
                            h3 = hexVal(hex.charCodeAt(2 + i));
                        if (len - i >= 6 ? (r = (h1 << 4) + h2, g = (h3 << 4) + hexVal(hex.charCodeAt(3 + i)), b = (hexVal(hex.charCodeAt(4 + i)) << 4) + hexVal(hex.charCodeAt(5 + i))) : (r = (h1 << 4) + h1, g = (h2 << 4) + h2, b = (h3 << 4) + h3), 0 > r || r > 255 || 0 > g || g > 255 || 0 > b || b > 255) throw new Error("hex input is invalid");
                        return [r, g, b]
                    }

                    function rgb2hex(rgb) {
                        return "#" + ("000000" + ((rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16)).slice(-6)
                    }

                    function rgb2hsl(rgb) {
                        var h, s, l, r = rgb[0] / 255,
                            g = rgb[1] / 255,
                            b = rgb[2] / 255,
                            min = Math.min(r, g, b),
                            max = Math.max(r, g, b),
                            delta = max - min;
                        return max === min ? h = 0 : r === max ? h = (g - b) / delta : g === max ? h = 2 + (b - r) / delta : b === max && (h = 4 + (r - g) / delta), h = Math.min(60 * h, 360), 0 > h && (h += 360), l = (min + max) / 2, s = max === min ? 0 : .5 >= l ? delta / (max + min) : delta / (2 - max - min), [h, 100 * s, 100 * l]
                    }

                    function rgb2hsv(rgb) {
                        var h, s, v, r = rgb[0],
                            g = rgb[1],
                            b = rgb[2],
                            min = Math.min(r, g, b),
                            max = Math.max(r, g, b),
                            delta = max - min;
                        return s = 0 === max ? 0 : delta / max * 100, max === min ? h = 0 : r === max ? h = (g - b) / delta : g === max ? h = 2 + (b - r) / delta : b === max && (h = 4 + (r - g) / delta), h = Math.min(60 * h, 360), 0 > h && (h += 360), v = max / 255 * 100, [h, s, v]
                    }

                    function hsl2rgb(hsl) {
                        var r, g, b, h = hsl[0] / 360,
                            s = hsl[1] / 100,
                            l = hsl[2] / 100;
                        if (0 === s) r = g = b = l;
                        else {
                            var t, q = .5 > l ? l * (s + 1) : l + s - l * s,
                                p = 2 * l - q;
                            t = h + 1 / 3, 0 > t ? t += 1 : t > 1 && (t -= 1), r = 1 / 6 > t ? p + (q - p) * t * 6 : .5 > t ? q : 2 / 3 > t ? p + (q - p) * (2 / 3 - t) * 6 : p, t = h, 0 > t ? t += 1 : t > 1 && (t -= 1), g = 1 / 6 > t ? p + (q - p) * t * 6 : .5 > t ? q : 2 / 3 > t ? p + (q - p) * (2 / 3 - t) * 6 : p, t = h - 1 / 3, 0 > t ? t += 1 : t > 1 && (t -= 1), b = 1 / 6 > t ? p + (q - p) * t * 6 : .5 > t ? q : 2 / 3 > t ? p + (q - p) * (2 / 3 - t) * 6 : p
                        }
                        return [255 * r, 255 * g, 255 * b]
                    }

                    function hsl2hsv(hsl) {
                        var sv, v, h = hsl[0],
                            s = hsl[1] / 100,
                            l = hsl[2] / 100;
                        return 0 === s ? [h, 0, 100 * l] : 0 === l ? [h, 0, 0] : (l *= 2, s *= 1 >= l ? l : 2 - l, v = (l + s) / 2, sv = 2 * s / (l + s), [h, 100 * sv, 100 * v])
                    }

                    function hsv2rgb(hsv) {
                        var h = hsv[0] / 60,
                            s = hsv[1] / 100,
                            v = hsv[2] / 100,
                            hi = Math.floor(h) % 6,
                            f = h - Math.floor(h),
                            p = 255 * v * (1 - s),
                            q = 255 * v * (1 - s * f),
                            t = 255 * v * (1 - s * (1 - f));
                        switch (v = 255 * v, hi) {
                            case 0:
                                return [v, t, p];
                            case 1:
                                return [q, v, p];
                            case 2:
                                return [p, v, t];
                            case 3:
                                return [p, q, v];
                            case 4:
                                return [t, p, v];
                            case 5:
                                return [v, p, q]
                        }
                    }

                    function hsv2hsl(hsv) {
                        var sl, l, h = hsv[0],
                            s = hsv[1] / 100,
                            v = hsv[2] / 100;
                        return 0 === s ? [h, 0, 100 * v] : 0 === v ? [h, 0, 0] : (l = (2 - s) * v, sl = s * v, sl /= 1 >= l ? l : 2 - l, l /= 2, [h, 100 * sl, 100 * l])
                    }

                    function grayscale2rgb(value) {
                        return [value, value, value]
                    }

                    function rgb2grayscale(rgb) {
                        return (299 * rgb[0] + 587 * rgb[1] + 114 * rgb[2]) / 1e3
                    }
                    module.exports = {
                        grayscale: {
                            rgb: grayscale2rgb
                        },
                        hex: {
                            rgb: hex2rgb
                        },
                        rgb: {
                            hsl: rgb2hsl,
                            hsv: rgb2hsv,
                            hex: rgb2hex,
                            grayscale: rgb2grayscale
                        },
                        hsl: {
                            rgb: hsl2rgb,
                            hsv: hsl2hsv
                        },
                        hsv: {
                            rgb: hsv2rgb,
                            hsl: hsv2hsl
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(71), __webpack_require__(142), module.exports = __webpack_require__(10).Array.from
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(144), module.exports = __webpack_require__(10).Object.assign
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(145);
                    var $Object = __webpack_require__(10).Object;
                    module.exports = function (P, D) {
                        return $Object.create(P, D)
                    }
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(146);
                    var $Object = __webpack_require__(10).Object;
                    module.exports = function (it, key, desc) {
                        return $Object.defineProperty(it, key, desc)
                    }
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(147), module.exports = __webpack_require__(10).Object.setPrototypeOf
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(149), __webpack_require__(148), __webpack_require__(150), __webpack_require__(151), module.exports = __webpack_require__(10).Symbol
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(71), __webpack_require__(152), module.exports = __webpack_require__(50).f("iterator")
                }, function (module) {
                    module.exports = function (it) {
                        if ("function" != typeof it) throw TypeError(it + " is not a function!");
                        return it
                    }
                }, function (module) {
                    module.exports = function () {}
                }, function (module, exports, __webpack_require__) {
                    var toIObject = __webpack_require__(17),
                        toLength = __webpack_require__(70),
                        toIndex = __webpack_require__(140);
                    module.exports = function (IS_INCLUDES) {
                        return function ($this, el, fromIndex) {
                            var value, O = toIObject($this),
                                length = toLength(O.length),
                                index = toIndex(fromIndex, length);
                            if (IS_INCLUDES && el != el) {
                                for (; length > index;)
                                    if (value = O[index++], value != value) return !0
                            } else
                                for (; length > index; index++)
                                    if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
                            return !IS_INCLUDES && -1
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    var cof = __webpack_require__(36),
                        TAG = __webpack_require__(9)("toStringTag"),
                        ARG = "Arguments" == cof(function () {
                            return arguments
                        }()),
                        tryGet = function (it, key) {
                            try {
                                return it[key]
                            } catch (e) {}
                        };
                    module.exports = function (it) {
                        var O, T, B;
                        return void 0 === it ? "Undefined" : null === it ? "Null" : "string" == typeof (T = tryGet(O = Object(it), TAG)) ? T : ARG ? cof(O) : "Object" == (B = cof(O)) && "function" == typeof O.callee ? "Arguments" : B
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    var $defineProperty = __webpack_require__(13),
                        createDesc = __webpack_require__(27);
                    module.exports = function (object, index, value) {
                        index in object ? $defineProperty.f(object, index, createDesc(0, value)) : object[index] = value
                    }
                }, function (module, exports, __webpack_require__) {
                    var getKeys = __webpack_require__(26),
                        gOPS = __webpack_require__(42),
                        pIE = __webpack_require__(31);
                    module.exports = function (it) {
                        var result = getKeys(it),
                            getSymbols = gOPS.f;
                        if (getSymbols)
                            for (var key, symbols = getSymbols(it), isEnum = pIE.f, i = 0; symbols.length > i;) isEnum.call(it, key = symbols[i++]) && result.push(key);
                        return result
                    }
                }, function (module, exports, __webpack_require__) {
                    module.exports = __webpack_require__(12).document && document.documentElement
                }, function (module, exports, __webpack_require__) {
                    var Iterators = __webpack_require__(25),
                        ITERATOR = __webpack_require__(9)("iterator"),
                        ArrayProto = Array.prototype;
                    module.exports = function (it) {
                        return void 0 !== it && (Iterators.Array === it || ArrayProto[ITERATOR] === it)
                    }
                }, function (module, exports, __webpack_require__) {
                    var cof = __webpack_require__(36);
                    module.exports = Array.isArray || function (arg) {
                        return "Array" == cof(arg)
                    }
                }, function (module, exports, __webpack_require__) {
                    var anObject = __webpack_require__(19);
                    module.exports = function (iterator, fn, value, entries) {
                        try {
                            return entries ? fn(anObject(value)[0], value[1]) : fn(value)
                        } catch (e) {
                            var ret = iterator["return"];
                            throw void 0 !== ret && anObject(ret.call(iterator)), e
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    var create = __webpack_require__(41),
                        descriptor = __webpack_require__(27),
                        setToStringTag = __webpack_require__(43),
                        IteratorPrototype = {};
                    __webpack_require__(20)(IteratorPrototype, __webpack_require__(9)("iterator"), function () {
                        return this
                    }), module.exports = function (Constructor, NAME, next) {
                        Constructor.prototype = create(IteratorPrototype, {
                            next: descriptor(1, next)
                        }), setToStringTag(Constructor, NAME + " Iterator")
                    }
                }, function (module, exports, __webpack_require__) {
                    var ITERATOR = __webpack_require__(9)("iterator"),
                        SAFE_CLOSING = !1;
                    try {
                        var riter = [7][ITERATOR]();
                        riter["return"] = function () {
                            SAFE_CLOSING = !0
                        }, Array.from(riter, function () {
                            throw 2
                        })
                    } catch (e) {}
                    module.exports = function (exec, skipClosing) {
                        if (!skipClosing && !SAFE_CLOSING) return !1;
                        var safe = !1;
                        try {
                            var arr = [7],
                                iter = arr[ITERATOR]();
                            iter.next = function () {
                                return {
                                    done: safe = !0
                                }
                            }, arr[ITERATOR] = function () {
                                return iter
                            }, exec(arr)
                        } catch (e) {}
                        return safe
                    }
                }, function (module) {
                    module.exports = function (done, value) {
                        return {
                            value: value,
                            done: !!done
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    var getKeys = __webpack_require__(26),
                        toIObject = __webpack_require__(17);
                    module.exports = function (object, el) {
                        for (var key, O = toIObject(object), keys = getKeys(O), length = keys.length, index = 0; length > index;)
                            if (O[key = keys[index++]] === el) return key
                    }
                }, function (module, exports, __webpack_require__) {
                    var META = __webpack_require__(32)("meta"),
                        isObject = __webpack_require__(24),
                        has = __webpack_require__(16),
                        setDesc = __webpack_require__(13).f,
                        id = 0,
                        isExtensible = Object.isExtensible || function () {
                            return !0
                        },
                        FREEZE = !__webpack_require__(23)(function () {
                            return isExtensible(Object.preventExtensions({}))
                        }),
                        setMeta = function (it) {
                            setDesc(it, META, {
                                value: {
                                    i: "O" + ++id,
                                    w: {}
                                }
                            })
                        },
                        fastKey = function (it, create) {
                            if (!isObject(it)) return "symbol" == typeof it ? it : ("string" == typeof it ? "S" : "P") + it;
                            if (!has(it, META)) {
                                if (!isExtensible(it)) return "F";
                                if (!create) return "E";
                                setMeta(it)
                            }
                            return it[META].i
                        },
                        getWeak = function (it, create) {
                            if (!has(it, META)) {
                                if (!isExtensible(it)) return !0;
                                if (!create) return !1;
                                setMeta(it)
                            }
                            return it[META].w
                        },
                        onFreeze = function (it) {
                            return FREEZE && meta.NEED && isExtensible(it) && !has(it, META) && setMeta(it), it
                        },
                        meta = module.exports = {
                            KEY: META,
                            NEED: !1,
                            fastKey: fastKey,
                            getWeak: getWeak,
                            onFreeze: onFreeze
                        }
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    var getKeys = __webpack_require__(26),
                        gOPS = __webpack_require__(42),
                        pIE = __webpack_require__(31),
                        toObject = __webpack_require__(47),
                        IObject = __webpack_require__(64),
                        $assign = Object.assign;
                    module.exports = !$assign || __webpack_require__(23)(function () {
                        var A = {},
                            B = {},
                            S = Symbol(),
                            K = "abcdefghijklmnopqrst";
                        return A[S] = 7, K.split("").forEach(function (k) {
                            B[k] = k
                        }), 7 != $assign({}, A)[S] || Object.keys($assign({}, B)).join("") != K
                    }) ? function (target) {
                        for (var T = toObject(target), aLen = arguments.length, index = 1, getSymbols = gOPS.f, isEnum = pIE.f; aLen > index;)
                            for (var key, S = IObject(arguments[index++]), keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S), length = keys.length, j = 0; length > j;) isEnum.call(S, key = keys[j++]) && (T[key] = S[key]);
                        return T
                    } : $assign
                }, function (module, exports, __webpack_require__) {
                    var dP = __webpack_require__(13),
                        anObject = __webpack_require__(19),
                        getKeys = __webpack_require__(26);
                    module.exports = __webpack_require__(14) ? Object.defineProperties : function (O, Properties) {
                        anObject(O);
                        for (var P, keys = getKeys(Properties), length = keys.length, i = 0; length > i;) dP.f(O, P = keys[i++], Properties[P]);
                        return O
                    }
                }, function (module, exports, __webpack_require__) {
                    var toIObject = __webpack_require__(17),
                        gOPN = __webpack_require__(67).f,
                        toString = {}.toString,
                        windowNames = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [],
                        getWindowNames = function (it) {
                            try {
                                return gOPN(it)
                            } catch (e) {
                                return windowNames.slice()
                            }
                        };
                    module.exports.f = function (it) {
                        return windowNames && "[object Window]" == toString.call(it) ? getWindowNames(it) : gOPN(toIObject(it))
                    }
                }, function (module, exports, __webpack_require__) {
                    var has = __webpack_require__(16),
                        toObject = __webpack_require__(47),
                        IE_PROTO = __webpack_require__(44)("IE_PROTO"),
                        ObjectProto = Object.prototype;
                    module.exports = Object.getPrototypeOf || function (O) {
                        return O = toObject(O), has(O, IE_PROTO) ? O[IE_PROTO] : "function" == typeof O.constructor && O instanceof O.constructor ? O.constructor.prototype : O instanceof Object ? ObjectProto : null
                    }
                }, function (module, exports, __webpack_require__) {
                    var isObject = __webpack_require__(24),
                        anObject = __webpack_require__(19),
                        check = function (O, proto) {
                            if (anObject(O), !isObject(proto) && null !== proto) throw TypeError(proto + ": can't set as prototype!")
                        };
                    module.exports = {
                        set: Object.setPrototypeOf || ("__proto__" in {} ? function (test, buggy, set) {
                            try {
                                set = __webpack_require__(37)(Function.call, __webpack_require__(66).f(Object.prototype, "__proto__").set, 2), set(test, []), buggy = !(test instanceof Array)
                            } catch (e) {
                                buggy = !0
                            }
                            return function (O, proto) {
                                return check(O, proto), buggy ? O.__proto__ = proto : set(O, proto), O
                            }
                        }({}, !1) : void 0),
                        check: check
                    }
                }, function (module, exports, __webpack_require__) {
                    var toInteger = __webpack_require__(46),
                        defined = __webpack_require__(38);
                    module.exports = function (TO_STRING) {
                        return function (that, pos) {
                            var a, b, s = String(defined(that)),
                                i = toInteger(pos),
                                l = s.length;
                            return 0 > i || i >= l ? TO_STRING ? "" : void 0 : (a = s.charCodeAt(i), 55296 > a || a > 56319 || i + 1 === l || (b = s.charCodeAt(i + 1)) < 56320 || b > 57343 ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 55296 << 10) + (b - 56320) + 65536)
                        }
                    }
                }, function (module, exports, __webpack_require__) {
                    var toInteger = __webpack_require__(46),
                        max = Math.max,
                        min = Math.min;
                    module.exports = function (index, length) {
                        return index = toInteger(index), 0 > index ? max(index + length, 0) : min(index, length)
                    }
                }, function (module, exports, __webpack_require__) {
                    var classof = __webpack_require__(122),
                        ITERATOR = __webpack_require__(9)("iterator"),
                        Iterators = __webpack_require__(25);
                    module.exports = __webpack_require__(10).getIteratorMethod = function (it) {
                        return void 0 != it ? it[ITERATOR] || it["@@iterator"] || Iterators[classof(it)] : void 0
                    }
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    var ctx = __webpack_require__(37),
                        $export = __webpack_require__(15),
                        toObject = __webpack_require__(47),
                        call = __webpack_require__(128),
                        isArrayIter = __webpack_require__(126),
                        toLength = __webpack_require__(70),
                        createProperty = __webpack_require__(123),
                        getIterFn = __webpack_require__(141);
                    $export($export.S + $export.F * !__webpack_require__(130)(function (iter) {
                        Array.from(iter)
                    }), "Array", {
                        from: function (arrayLike) {
                            var length, result, step, iterator, O = toObject(arrayLike),
                                C = "function" == typeof this ? this : Array,
                                aLen = arguments.length,
                                mapfn = aLen > 1 ? arguments[1] : void 0,
                                mapping = void 0 !== mapfn,
                                index = 0,
                                iterFn = getIterFn(O);
                            if (mapping && (mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : void 0, 2)), void 0 == iterFn || C == Array && isArrayIter(iterFn))
                                for (length = toLength(O.length), result = new C(length); length > index; index++) createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
                            else
                                for (iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++) createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], !0) : step.value);
                            return result.length = index, result
                        }
                    })
                }, function (module, exports, __webpack_require__) {
                    "use strict";
                    var addToUnscopables = __webpack_require__(120),
                        step = __webpack_require__(131),
                        Iterators = __webpack_require__(25),
                        toIObject = __webpack_require__(17);
                    module.exports = __webpack_require__(65)(Array, "Array", function (iterated, kind) {
                        this._t = toIObject(iterated), this._i = 0, this._k = kind
                    }, function () {
                        var O = this._t,
                            kind = this._k,
                            index = this._i++;
                        return !O || index >= O.length ? (this._t = void 0, step(1)) : "keys" == kind ? step(0, index) : "values" == kind ? step(0, O[index]) : step(0, [index, O[index]])
                    }, "values"), Iterators.Arguments = Iterators.Array, addToUnscopables("keys"), addToUnscopables("values"), addToUnscopables("entries")
                }, function (module, exports, __webpack_require__) {
                    var $export = __webpack_require__(15);
                    $export($export.S + $export.F, "Object", {
                        assign: __webpack_require__(134)
                    })
                }, function (module, exports, __webpack_require__) {
                    var $export = __webpack_require__(15);
                    $export($export.S, "Object", {
                        create: __webpack_require__(41)
                    })
                }, function (module, exports, __webpack_require__) {
                    var $export = __webpack_require__(15);
                    $export($export.S + $export.F * !__webpack_require__(14), "Object", {
                        defineProperty: __webpack_require__(13).f
                    })
                }, function (module, exports, __webpack_require__) {
                    var $export = __webpack_require__(15);
                    $export($export.S, "Object", {
                        setPrototypeOf: __webpack_require__(138).set
                    })
                }, function () {}, function (module, exports, __webpack_require__) {
                    "use strict";
                    var global = __webpack_require__(12),
                        has = __webpack_require__(16),
                        DESCRIPTORS = __webpack_require__(14),
                        $export = __webpack_require__(15),
                        redefine = __webpack_require__(69),
                        META = __webpack_require__(133).KEY,
                        $fails = __webpack_require__(23),
                        shared = __webpack_require__(45),
                        setToStringTag = __webpack_require__(43),
                        uid = __webpack_require__(32),
                        wks = __webpack_require__(9),
                        wksExt = __webpack_require__(50),
                        wksDefine = __webpack_require__(49),
                        keyOf = __webpack_require__(132),
                        enumKeys = __webpack_require__(124),
                        isArray = __webpack_require__(127),
                        anObject = __webpack_require__(19),
                        toIObject = __webpack_require__(17),
                        toPrimitive = __webpack_require__(48),
                        createDesc = __webpack_require__(27),
                        _create = __webpack_require__(41),
                        gOPNExt = __webpack_require__(136),
                        $GOPD = __webpack_require__(66),
                        $DP = __webpack_require__(13),
                        $keys = __webpack_require__(26),
                        gOPD = $GOPD.f,
                        dP = $DP.f,
                        gOPN = gOPNExt.f,
                        $Symbol = global.Symbol,
                        $JSON = global.JSON,
                        _stringify = $JSON && $JSON.stringify,
                        PROTOTYPE = "prototype",
                        HIDDEN = wks("_hidden"),
                        TO_PRIMITIVE = wks("toPrimitive"),
                        isEnum = {}.propertyIsEnumerable,
                        SymbolRegistry = shared("symbol-registry"),
                        AllSymbols = shared("symbols"),
                        OPSymbols = shared("op-symbols"),
                        ObjectProto = Object[PROTOTYPE],
                        USE_NATIVE = "function" == typeof $Symbol,
                        QObject = global.QObject,
                        setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild,
                        setSymbolDesc = DESCRIPTORS && $fails(function () {
                            return 7 != _create(dP({}, "a", {
                                get: function () {
                                    return dP(this, "a", {
                                        value: 7
                                    }).a
                                }
                            })).a
                        }) ? function (it, key, D) {
                            var protoDesc = gOPD(ObjectProto, key);
                            protoDesc && delete ObjectProto[key], dP(it, key, D), protoDesc && it !== ObjectProto && dP(ObjectProto, key, protoDesc)
                        } : dP,
                        wrap = function (tag) {
                            var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
                            return sym._k = tag, sym
                        },
                        isSymbol = USE_NATIVE && "symbol" == typeof $Symbol.iterator ? function (it) {
                            return "symbol" == typeof it
                        } : function (it) {
                            return it instanceof $Symbol
                        },
                        $defineProperty = function (it, key, D) {
                            return it === ObjectProto && $defineProperty(OPSymbols, key, D), anObject(it), key = toPrimitive(key, !0), anObject(D), has(AllSymbols, key) ? (D.enumerable ? (has(it, HIDDEN) && it[HIDDEN][key] && (it[HIDDEN][key] = !1), D = _create(D, {
                                enumerable: createDesc(0, !1)
                            })) : (has(it, HIDDEN) || dP(it, HIDDEN, createDesc(1, {})), it[HIDDEN][key] = !0), setSymbolDesc(it, key, D)) : dP(it, key, D)
                        },
                        $defineProperties = function (it, P) {
                            anObject(it);
                            for (var key, keys = enumKeys(P = toIObject(P)), i = 0, l = keys.length; l > i;) $defineProperty(it, key = keys[i++], P[key]);
                            return it
                        },
                        $create = function (it, P) {
                            return void 0 === P ? _create(it) : $defineProperties(_create(it), P)
                        },
                        $propertyIsEnumerable = function (key) {
                            var E = isEnum.call(this, key = toPrimitive(key, !0));
                            return this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key) ? !1 : E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : !0
                        },
                        $getOwnPropertyDescriptor = function (it, key) {
                            if (it = toIObject(it), key = toPrimitive(key, !0), it !== ObjectProto || !has(AllSymbols, key) || has(OPSymbols, key)) {
                                var D = gOPD(it, key);
                                return !D || !has(AllSymbols, key) || has(it, HIDDEN) && it[HIDDEN][key] || (D.enumerable = !0), D
                            }
                        },
                        $getOwnPropertyNames = function (it) {
                            for (var key, names = gOPN(toIObject(it)), result = [], i = 0; names.length > i;) has(AllSymbols, key = names[i++]) || key == HIDDEN || key == META || result.push(key);
                            return result
                        },
                        $getOwnPropertySymbols = function (it) {
                            for (var key, IS_OP = it === ObjectProto, names = gOPN(IS_OP ? OPSymbols : toIObject(it)), result = [], i = 0; names.length > i;) has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : !0) && result.push(AllSymbols[key]);
                            return result
                        };
                    USE_NATIVE || ($Symbol = function () {
                        if (this instanceof $Symbol) throw TypeError("Symbol is not a constructor!");
                        var tag = uid(arguments.length > 0 ? arguments[0] : void 0),
                            $set = function (value) {
                                this === ObjectProto && $set.call(OPSymbols, value), has(this, HIDDEN) && has(this[HIDDEN], tag) && (this[HIDDEN][tag] = !1), setSymbolDesc(this, tag, createDesc(1, value))
                            };
                        return DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
                            configurable: !0,
                            set: $set
                        }), wrap(tag)
                    }, redefine($Symbol[PROTOTYPE], "toString", function () {
                        return this._k
                    }), $GOPD.f = $getOwnPropertyDescriptor, $DP.f = $defineProperty, __webpack_require__(67).f = gOPNExt.f = $getOwnPropertyNames, __webpack_require__(31).f = $propertyIsEnumerable, __webpack_require__(42).f = $getOwnPropertySymbols, DESCRIPTORS && !__webpack_require__(40) && redefine(ObjectProto, "propertyIsEnumerable", $propertyIsEnumerable, !0), wksExt.f = function (name) {
                        return wrap(wks(name))
                    }), $export($export.G + $export.W + $export.F * !USE_NATIVE, {
                        Symbol: $Symbol
                    });
                    for (var symbols = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), i = 0; symbols.length > i;) wks(symbols[i++]);
                    for (var symbols = $keys(wks.store), i = 0; symbols.length > i;) wksDefine(symbols[i++]);
                    $export($export.S + $export.F * !USE_NATIVE, "Symbol", {
                        "for": function (key) {
                            return has(SymbolRegistry, key += "") ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key)
                        },
                        keyFor: function (key) {
                            if (isSymbol(key)) return keyOf(SymbolRegistry, key);
                            throw TypeError(key + " is not a symbol!")
                        },
                        useSetter: function () {
                            setter = !0
                        },
                        useSimple: function () {
                            setter = !1
                        }
                    }), $export($export.S + $export.F * !USE_NATIVE, "Object", {
                        create: $create,
                        defineProperty: $defineProperty,
                        defineProperties: $defineProperties,
                        getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
                        getOwnPropertyNames: $getOwnPropertyNames,
                        getOwnPropertySymbols: $getOwnPropertySymbols
                    }), $JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
                        var S = $Symbol();
                        return "[null]" != _stringify([S]) || "{}" != _stringify({
                            a: S
                        }) || "{}" != _stringify(Object(S))
                    })), "JSON", {
                        stringify: function (it) {
                            if (void 0 !== it && !isSymbol(it)) {
                                for (var replacer, $replacer, args = [it], i = 1; arguments.length > i;) args.push(arguments[i++]);
                                return replacer = args[1], "function" == typeof replacer && ($replacer = replacer), ($replacer || !isArray(replacer)) && (replacer = function (key, value) {
                                    return $replacer && (value = $replacer.call(this, key, value)), isSymbol(value) ? void 0 : value
                                }), args[1] = replacer, _stringify.apply($JSON, args)
                            }
                        }
                    }), $Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(20)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf), setToStringTag($Symbol, "Symbol"), setToStringTag(Math, "Math", !0), setToStringTag(global.JSON, "JSON", !0)
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(49)("asyncIterator")
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(49)("observable")
                }, function (module, exports, __webpack_require__) {
                    __webpack_require__(143);
                    for (var global = __webpack_require__(12), hide = __webpack_require__(20), Iterators = __webpack_require__(25), TO_STRING_TAG = __webpack_require__(9)("toStringTag"), collections = ["NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList"], i = 0; 5 > i; i++) {
                        var NAME = collections[i],
                            Collection = global[NAME],
                            proto = Collection && Collection.prototype;
                        proto && !proto[TO_STRING_TAG] && hide(proto, TO_STRING_TAG, NAME), Iterators[NAME] = Iterators.Array
                    }
                }, function (module, exports) {
                    ! function (root, factory) {
                        module.exports = factory()
                    }(this, function () {
                        return function (modules) {
                            function __webpack_require__(moduleId) {
                                if (installedModules[moduleId]) return installedModules[moduleId].exports;
                                var module = installedModules[moduleId] = {
                                    exports: {},
                                    id: moduleId,
                                    loaded: !1
                                };
                                return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), module.loaded = !0, module.exports
                            }
                            var installedModules = {};
                            return __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.p = "", __webpack_require__(0)
                        }([function (module, exports, __webpack_require__) {
                            "use strict";

                            function __export(m) {
                                for (var p in m) exports.hasOwnProperty(p) || (exports[p] = m[p])
                            }
                            var Reflect = __webpack_require__(1);
                            window.Reflect = Reflect, __export(__webpack_require__(1))
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function decorate(decorators, target, targetKey, targetDescriptor) {
                                if (is_undefined_1.isUndefined(targetDescriptor)) {
                                    if (is_undefined_1.isUndefined(targetKey)) {
                                        if (!is_array_1.isArray(decorators)) throw new TypeError("decorators " + decorators + " is not an array of decorators");
                                        if (!is_constructor_1.isConstructor(target)) throw new TypeError("target " + target + " is not a constructor");
                                        return DecorateConstructor(decorators, target)
                                    }
                                    if (!is_array_1.isArray(decorators)) throw new TypeError("decorators " + decorators + " is not an array of decorators");
                                    if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                    return targetKey = to_property_key_1.toPropertyKey(targetKey), DecoratePropertyWithoutDescriptor(decorators, target, targetKey)
                                }
                                if (!is_array_1.isArray(decorators)) throw new TypeError("decorators " + decorators + " is not an array of decorators");
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                if (is_undefined_1.isUndefined(targetKey)) throw new TypeError("target key " + targetKey + "is undefined");
                                if (!is_object_1.isObject(targetDescriptor)) throw new TypeError("targetDescriptor " + targetDescriptor + " is not an object");
                                return targetKey = to_property_key_1.toPropertyKey(targetKey), DecoratePropertyWithDescriptor(decorators, target, targetKey, targetDescriptor)
                            }

                            function metadata(metadataKey, metadataValue) {
                                function decorator(target, targetKey) {
                                    if (is_undefined_1.isUndefined(targetKey)) {
                                        if (!is_constructor_1.isConstructor(target)) throw new TypeError("target " + target + " is not a constructor");
                                        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, void 0)
                                    } else {
                                        if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                        targetKey = to_property_key_1.toPropertyKey(targetKey), OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey)
                                    }
                                }
                                return decorator
                            }

                            function defineMetadata(metadataKey, metadataValue, target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                return is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey)), OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey)
                            }

                            function hasMetadata(metadataKey, target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                return is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey)), OrdinaryHasMetadata(metadataKey, target, targetKey)
                            }

                            function hasOwnMetadata(metadataKey, target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                return is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey)), OrdinaryHasOwnMetadata(metadataKey, target, targetKey)
                            }

                            function getMetadata(metadataKey, target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                return is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey)), OrdinaryGetMetadata(metadataKey, target, targetKey)
                            }

                            function getOwnMetadata(metadataKey, target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                return is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey)), OrdinaryGetOwnMetadata(metadataKey, target, targetKey)
                            }

                            function getMetadataKeys(target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                return is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey)), ordinary_metadata_keys_1.ordinaryMetadataKeys(target, targetKey)
                            }

                            function getOwnMetadataKeys(target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                return is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey)), ordinary_own_metadata_keys_1.ordinaryOwnMetadataKeys(target, targetKey)
                            }

                            function deleteMetadata(metadataKey, target, targetKey) {
                                if (!is_object_1.isObject(target)) throw new TypeError("target " + target + " is not an object");
                                is_undefined_1.isUndefined(targetKey) || (targetKey = to_property_key_1.toPropertyKey(targetKey));
                                var metadataMap = get_or_create_metadata_map_1.getOrCreateMetadataMap(target, targetKey, !1);
                                if (is_undefined_1.isUndefined(metadataMap)) return !1;
                                if (!metadataMap["delete"](metadataKey)) return !1;
                                if (metadataMap.size > 0) return !0;
                                var targetMetadata = metadata_1.__Metadata__.get(target);
                                return targetMetadata["delete"](targetKey), targetMetadata.size > 0 ? !0 : (metadata_1.__Metadata__["delete"](target), !0)
                            }

                            function DecorateConstructor(decorators, target) {
                                for (var i = decorators.length - 1; i >= 0; --i) {
                                    var decorator = decorators[i],
                                        decorated = decorator(target);
                                    if (!is_undefined_1.isUndefined(decorated)) {
                                        if (!is_constructor_1.isConstructor(decorated)) throw new TypeError("target " + target + " is not a constructor");
                                        target = decorated
                                    }
                                }
                                return target
                            }

                            function DecoratePropertyWithDescriptor(decorators, target, propertyKey, descriptor) {
                                for (var i = decorators.length - 1; i >= 0; --i) {
                                    var decorator = decorators[i],
                                        decorated = decorator(target, propertyKey, descriptor);
                                    if (!is_undefined_1.isUndefined(decorated)) {
                                        if (!is_object_1.isObject(decorated)) throw new TypeError("decorated " + decorated + " is not an object");
                                        descriptor = decorated
                                    }
                                }
                                return descriptor
                            }

                            function DecoratePropertyWithoutDescriptor(decorators, target, propertyKey) {
                                for (var i = decorators.length - 1; i >= 0; --i) {
                                    var decorator = decorators[i];
                                    decorator(target, propertyKey)
                                }
                            }

                            function OrdinaryHasMetadata(MetadataKey, O, P) {
                                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                                if (hasOwn) return !0;
                                var parent = get_proto_of_type_1.getProtoOfType(O);
                                return null !== parent ? OrdinaryHasMetadata(MetadataKey, parent, P) : !1
                            }

                            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                                var metadataMap = get_or_create_metadata_map_1.getOrCreateMetadataMap(O, P, !1);
                                return void 0 === metadataMap ? !1 : Boolean(metadataMap.has(MetadataKey))
                            }

                            function OrdinaryGetMetadata(MetadataKey, O, P) {
                                var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
                                if (hasOwn) return OrdinaryGetOwnMetadata(MetadataKey, O, P);
                                var parent = get_proto_of_type_1.getProtoOfType(O);
                                return null !== parent ? OrdinaryGetMetadata(MetadataKey, parent, P) : void 0
                            }

                            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                                var metadataMap = get_or_create_metadata_map_1.getOrCreateMetadataMap(O, P, !1);
                                return void 0 === metadataMap ? void 0 : metadataMap.get(MetadataKey)
                            }

                            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                                var metadataMap = get_or_create_metadata_map_1.getOrCreateMetadataMap(O, P, !0);
                                metadataMap.set(MetadataKey, MetadataValue)
                            }
                            var get_proto_of_type_1 = __webpack_require__(2),
                                to_property_key_1 = __webpack_require__(3),
                                is_constructor_1 = __webpack_require__(5),
                                is_undefined_1 = __webpack_require__(6),
                                is_array_1 = __webpack_require__(7),
                                is_object_1 = __webpack_require__(8),
                                metadata_1 = __webpack_require__(9),
                                ordinary_own_metadata_keys_1 = __webpack_require__(18),
                                get_or_create_metadata_map_1 = __webpack_require__(19),
                                ordinary_metadata_keys_1 = __webpack_require__(21);
                            exports.decorate = decorate, exports.metadata = metadata, exports.defineMetadata = defineMetadata, exports.hasMetadata = hasMetadata, exports.hasOwnMetadata = hasOwnMetadata, exports.getMetadata = getMetadata, exports.getOwnMetadata = getOwnMetadata, exports.getMetadataKeys = getMetadataKeys, exports.getOwnMetadataKeys = getOwnMetadataKeys, exports.deleteMetadata = deleteMetadata
                        }, function (module, exports) {
                            "use strict";

                            function getProtoOfType(O) {
                                var proto = Object.getPrototypeOf(O);
                                if ("function" != typeof O || O === functionPrototype) return proto;
                                if (proto !== functionPrototype) return proto;
                                var prototype = O.prototype,
                                    prototypeProto = prototype && Object.getPrototypeOf(prototype);
                                if (null == prototypeProto || prototypeProto === Object.prototype) return proto;
                                var constructor = prototypeProto.constructor;
                                return "function" != typeof constructor ? proto : constructor === O ? proto : constructor
                            }
                            var functionPrototype = Function.prototype;
                            exports.getProtoOfType = getProtoOfType
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function toPropertyKey(value) {
                                return is_symbol_1.isSymbol(value) ? value : String(value)
                            }
                            var is_symbol_1 = __webpack_require__(4);
                            exports.toPropertyKey = toPropertyKey
                        }, function (module, exports) {
                            "use strict";

                            function isSymbol(x) {
                                return "symbol" == typeof x
                            }
                            exports.isSymbol = isSymbol
                        }, function (module, exports) {
                            "use strict";

                            function isConstructor(x) {
                                return "function" == typeof x
                            }
                            exports.isConstructor = isConstructor
                        }, function (module, exports) {
                            "use strict";

                            function isUndefined(x) {
                                return void 0 === x
                            }
                            exports.isUndefined = isUndefined
                        }, function (module, exports) {
                            "use strict";

                            function isArray(x) {
                                return Array.isArray(x)
                            }
                            exports.isArray = isArray
                        }, function (module, exports) {
                            "use strict";

                            function isObject(x) {
                                return "object" == typeof x ? null !== x : "function" == typeof x
                            }
                            exports.isObject = isObject
                        }, function (module, exports, __webpack_require__) {
                            "use strict";
                            var weakmap_1 = __webpack_require__(10),
                                _WeakMap = "function" == typeof WeakMap ? WeakMap : weakmap_1.createWeakMapPolyfill();
                            exports.__Metadata__ = new _WeakMap
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function createWeakMapPolyfill() {
                                return WeakMap
                            }
                            var create_unique_key_1 = __webpack_require__(11),
                                get_or_create_weakmap_1 = __webpack_require__(17);
                            exports.rootKey = create_unique_key_1.createUniqueKey();
                            var WeakMap = function () {
                                function WeakMap() {
                                    this._key = create_unique_key_1.createUniqueKey()
                                }
                                return Object.defineProperty(WeakMap.prototype, "length", {
                                    get: function () {
                                        return 0
                                    },
                                    enumerable: !0,
                                    configurable: !0
                                }), WeakMap.prototype.has = function (target) {
                                    var table = get_or_create_weakmap_1.getOrCreateWeakMapTable(exports.rootKey, target, !1);
                                    return table ? this._key in table : !1
                                }, WeakMap.prototype.get = function (target) {
                                    var table = get_or_create_weakmap_1.getOrCreateWeakMapTable(exports.rootKey, target, !1);
                                    return table ? table[this._key] : void 0
                                }, WeakMap.prototype.set = function (target, value) {
                                    var table = get_or_create_weakmap_1.getOrCreateWeakMapTable(exports.rootKey, target, !0);
                                    return table[this._key] = value, this
                                }, WeakMap.prototype["delete"] = function (target) {
                                    var table = get_or_create_weakmap_1.getOrCreateWeakMapTable(exports.rootKey, target, !1);
                                    return table && this._key in table ? delete table[this._key] : !1
                                }, WeakMap.prototype.clear = function () {
                                    this._key = create_unique_key_1.createUniqueKey()
                                }, WeakMap
                            }();
                            exports.WeakMap = WeakMap, exports.createWeakMapPolyfill = createWeakMapPolyfill
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function createUniqueKey() {
                                var key;
                                do key = helper_constants_1.WEAKMAP_PREFIX + create_uuid_1.createUUID(); while (has_own_1.hasOwn.call(exports.keys, key));
                                return exports.keys[key] = !0, key
                            }
                            var helper_constants_1 = __webpack_require__(12),
                                has_own_1 = __webpack_require__(13),
                                create_uuid_1 = __webpack_require__(14);
                            exports.keys = {}, exports.createUniqueKey = createUniqueKey
                        }, function (module, exports) {
                            "use strict";
                            exports.UUID_SIZE = 16, exports.WEAKMAP_PREFIX = "@@WeakMap@@"
                        }, function (module, exports) {
                            "use strict";
                            exports.hasOwn = Object.prototype.hasOwnProperty
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function createUUID() {
                                var data = gen_randombytes_1.genRandomBytes(helper_constants_1.UUID_SIZE);
                                data[6] = 79 & data[6] | 64, data[8] = 191 & data[8] | 128;
                                for (var result = "", offset = 0; offset < helper_constants_1.UUID_SIZE; ++offset) {
                                    var byte = data[offset];
                                    (4 === offset || 6 === offset || 8 === offset) && (result += "-"), 16 > byte && (result += "0"), result += byte.toString(16).toLowerCase()
                                }
                                return result
                            }
                            var helper_constants_1 = __webpack_require__(12),
                                gen_randombytes_1 = __webpack_require__(15);
                            exports.createUUID = createUUID
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function genRandomBytes(size) {
                                var data;
                                return "function" == typeof Uint8Array ? (data = new Uint8Array(size), "undefined" != typeof window.crypto ? window.crypto.getRandomValues(data) : "undefined" != typeof window.msCrypto ? window.msCrypto.getRandomValues(data) : fill_randombytes_1.fillRandomBytes(data, size)) : (data = new Array(size), fill_randombytes_1.fillRandomBytes(data, size)), data
                            }
                            var fill_randombytes_1 = __webpack_require__(16);
                            exports.genRandomBytes = genRandomBytes
                        }, function (module, exports) {
                            "use strict";

                            function fillRandomBytes(buffer, size) {
                                for (var i = 0; size > i; ++i) buffer[i] = 255 * Math.random() | 0;
                                return buffer
                            }
                            exports.fillRandomBytes = fillRandomBytes
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function getOrCreateWeakMapTable(rootKey, target, create) {
                                if (!has_own_1.hasOwn.call(target, rootKey)) {
                                    if (!create) return void 0;
                                    Object.defineProperty(target, rootKey, {
                                        value: Object.create(null)
                                    })
                                }
                                return target[rootKey]
                            }
                            var has_own_1 = __webpack_require__(13);
                            exports.getOrCreateWeakMapTable = getOrCreateWeakMapTable
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function ordinaryOwnMetadataKeys(target, targetKey) {
                                var metadataMap = get_or_create_metadata_map_1.getOrCreateMetadataMap(target, targetKey, !1),
                                    keys = [];
                                return metadataMap && metadataMap.forEach(function (_, key) {
                                    return keys.push(key)
                                }), keys
                            }
                            var get_or_create_metadata_map_1 = __webpack_require__(19);
                            exports.ordinaryOwnMetadataKeys = ordinaryOwnMetadataKeys
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function getOrCreateMetadataMap(target, targetKey, create) {
                                var targetMetadata = metadata_1.__Metadata__.get(target);
                                if (!targetMetadata) {
                                    if (!create) return void 0;
                                    targetMetadata = new _Map, metadata_1.__Metadata__.set(target, targetMetadata)
                                }
                                var keyMetadata = targetMetadata.get(targetKey);
                                if (!keyMetadata) {
                                    if (!create) return void 0;
                                    keyMetadata = new _Map, targetMetadata.set(targetKey, keyMetadata)
                                }
                                return keyMetadata
                            }
                            var metadata_1 = __webpack_require__(9),
                                map_1 = __webpack_require__(20),
                                _Map = "function" == typeof Map ? Map : map_1.createMapPolyfill();
                            exports.getOrCreateMetadataMap = getOrCreateMetadataMap
                        }, function (module, exports) {
                            "use strict";

                            function createMapPolyfill() {
                                return Map
                            }
                            exports.cacheSentinel = {};
                            var Map = function () {
                                function Map() {
                                    this._keys = [], this._values = [], this._cache = exports.cacheSentinel
                                }
                                return Object.defineProperty(Map.prototype, "length", {
                                    get: function () {
                                        return 0
                                    },
                                    enumerable: !0,
                                    configurable: !0
                                }), Object.defineProperty(Map.prototype, "size", {
                                    get: function () {
                                        return this._keys.length
                                    },
                                    enumerable: !0,
                                    configurable: !0
                                }), Map.prototype.has = function (key) {
                                    return key === this._cache ? !0 : this._find(key) >= 0 ? (this._cache = key, !0) : !1
                                }, Map.prototype.get = function (key) {
                                    var index = this._find(key);
                                    return index >= 0 ? (this._cache = key, this._values[index]) : void 0
                                }, Map.prototype.set = function (key, value) {
                                    return this["delete"](key), this._keys.push(key), this._values.push(value), this._cache = key, this
                                }, Map.prototype["delete"] = function (key) {
                                    var index = this._find(key);
                                    return index >= 0 ? (this._keys.splice(index, 1), this._values.splice(index, 1), this._cache = exports.cacheSentinel, !0) : !1
                                }, Map.prototype.clear = function () {
                                    this._keys.length = 0, this._values.length = 0, this._cache = exports.cacheSentinel
                                }, Map.prototype.forEach = function (callback) {
                                    for (var size = this.size, i = 0; size > i; ++i) {
                                        var key = this._keys[i],
                                            value = this._values[i];
                                        this._cache = key, callback.call(this, value, key, this)
                                    }
                                }, Map.prototype._find = function (key) {
                                    for (var keys = this._keys, size = keys.length, i = 0; size > i; ++i)
                                        if (keys[i] === key) return i;
                                    return -1
                                }, Map
                            }();
                            exports.Map = Map, exports.createMapPolyfill = createMapPolyfill
                        }, function (module, exports, __webpack_require__) {
                            "use strict";

                            function ordinaryMetadataKeys(O, P) {
                                var ownKeys = ordinary_own_metadata_keys_1.ordinaryOwnMetadataKeys(O, P),
                                    parent = get_proto_of_type_1.getProtoOfType(O);
                                if (null === parent) return ownKeys;
                                var parentKeys = ordinaryMetadataKeys(parent, P);
                                if (parentKeys.length <= 0) return ownKeys;
                                if (ownKeys.length <= 0) return parentKeys;
                                for (var set = new _Set, keys = [], _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                                    var key = ownKeys_1[_i],
                                        hasKey = set.has(key);
                                    hasKey || (set.add(key), keys.push(key))
                                }
                                for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                                    var key = parentKeys_1[_a],
                                        hasKey = set.has(key);
                                    hasKey || (set.add(key), keys.push(key))
                                }
                                return keys
                            }
                            var ordinary_own_metadata_keys_1 = __webpack_require__(18),
                                get_proto_of_type_1 = __webpack_require__(2),
                                set_1 = __webpack_require__(22),
                                _Set = "function" == typeof Set ? Set : set_1.createSetPolyfill();
                            exports.ordinaryMetadataKeys = ordinaryMetadataKeys
                        }, function (module, exports) {
                            "use strict";

                            function createSetPolyfill() {
                                return Set
                            }
                            exports.cacheSentinel = {};
                            var Set = function () {
                                function Set() {
                                    this._map = new Map
                                }
                                return Object.defineProperty(Set.prototype, "length", {
                                    get: function () {
                                        return 0
                                    },
                                    enumerable: !0,
                                    configurable: !0
                                }), Object.defineProperty(Set.prototype, "size", {
                                    get: function () {
                                        return this._map.size
                                    },
                                    enumerable: !0,
                                    configurable: !0
                                }), Set.prototype.has = function (value) {
                                    return this._map.has(value)
                                }, Set.prototype.add = function (value) {
                                    return this._map.set(value, value), this
                                }, Set.prototype["delete"] = function (value) {
                                    return this._map["delete"](value)
                                }, Set.prototype.clear = function () {
                                    this._map.clear()
                                }, Set.prototype.forEach = function (callback, thisArg) {
                                    this._map.forEach(callback, thisArg)
                                }, Set
                            }();
                            exports.Set = Set, exports.createSetPolyfill = createSetPolyfill
                        }])
                    })
                }])
            })
        }, {}],
        10: [function (require, module) {
            module.exports = function (THREE) {
                function OrbitConstraint(object) {
                    this.object = object, this.target = new THREE.Vector3, this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -(1 / 0), this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = .25;
                    var theta, phi, scope = this,
                        EPS = 1e-6,
                        phiDelta = 0,
                        thetaDelta = 0,
                        scale = 1,
                        panOffset = new THREE.Vector3,
                        zoomChanged = !1;
                    this.getPolarAngle = function () {
                        return phi
                    }, this.getAzimuthalAngle = function () {
                        return theta
                    }, this.rotateLeft = function (angle) {
                        thetaDelta -= angle
                    }, this.rotateUp = function (angle) {
                        phiDelta -= angle
                    }, this.panLeft = function () {
                        var v = new THREE.Vector3;
                        return function (distance) {
                            var te = this.object.matrix.elements;
                            v.set(te[0], te[1], te[2]), v.multiplyScalar(-distance), panOffset.add(v)
                        }
                    }(), this.panUp = function () {
                        var v = new THREE.Vector3;
                        return function (distance) {
                            var te = this.object.matrix.elements;
                            v.set(te[4], te[5], te[6]), v.multiplyScalar(distance), panOffset.add(v)
                        }
                    }(), this.pan = function (deltaX, deltaY, screenWidth, screenHeight) {
                        if (scope.object instanceof THREE.PerspectiveCamera) {
                            var position = scope.object.position,
                                offset = position.clone().sub(scope.target),
                                targetDistance = offset.length();
                            targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180), scope.panLeft(2 * deltaX * targetDistance / screenHeight), scope.panUp(2 * deltaY * targetDistance / screenHeight)
                        } else scope.object instanceof THREE.OrthographicCamera ? (scope.panLeft(deltaX * (scope.object.right - scope.object.left) / screenWidth), scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / screenHeight)) : console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.")
                    }, this.dollyIn = function (dollyScale) {
                        scope.object instanceof THREE.PerspectiveCamera ? scale /= dollyScale : scope.object instanceof THREE.OrthographicCamera ? (scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale)), scope.object.updateProjectionMatrix(), zoomChanged = !0) : console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")
                    }, this.dollyOut = function (dollyScale) {
                        scope.object instanceof THREE.PerspectiveCamera ? scale *= dollyScale : scope.object instanceof THREE.OrthographicCamera ? (scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale)), scope.object.updateProjectionMatrix(), zoomChanged = !0) : console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")
                    }, this.update = function () {
                        var offset = new THREE.Vector3,
                            quat = (new THREE.Quaternion).setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0)),
                            quatInverse = quat.clone().inverse(),
                            lastPosition = new THREE.Vector3,
                            lastQuaternion = new THREE.Quaternion;
                        return function () {
                            var position = this.object.position;
                            offset.copy(position).sub(this.target), offset.applyQuaternion(quat), theta = Math.atan2(offset.x, offset.z), phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y), theta += thetaDelta, phi += phiDelta, theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta)), phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi)), phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
                            var radius = offset.length() * scale;
                            return radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius)), this.target.add(panOffset), offset.x = radius * Math.sin(phi) * Math.sin(theta), offset.y = radius * Math.cos(phi), offset.z = radius * Math.sin(phi) * Math.cos(theta), offset.applyQuaternion(quatInverse), position.copy(this.target).add(offset), this.object.lookAt(this.target), this.enableDamping === !0 ? (thetaDelta *= 1 - this.dampingFactor, phiDelta *= 1 - this.dampingFactor) : (thetaDelta = 0, phiDelta = 0), scale = 1, panOffset.set(0, 0, 0), zoomChanged || lastPosition.distanceToSquared(this.object.position) > EPS || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ? (lastPosition.copy(this.object.position), lastQuaternion.copy(this.object.quaternion), zoomChanged = !1, !0) : !1
                        }
                    }()
                }

                function OrbitControls(object, domElement) {
                    function pan(deltaX, deltaY) {
                        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                        constraint.pan(deltaX, deltaY, element.clientWidth, element.clientHeight)
                    }

                    function getAutoRotationAngle() {
                        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed
                    }

                    function getZoomScale() {
                        return Math.pow(.95, scope.zoomSpeed)
                    }

                    function onMouseDown(event) {
                        if (scope.enabled !== !1) {
                            if (event.preventDefault(), event.button === scope.mouseButtons.ORBIT) {
                                if (scope.enableRotate === !1) return;
                                state = STATE.ROTATE, rotateStart.set(event.clientX, event.clientY)
                            } else if (event.button === scope.mouseButtons.ZOOM) {
                                if (scope.enableZoom === !1) return;
                                state = STATE.DOLLY, dollyStart.set(event.clientX, event.clientY)
                            } else if (event.button === scope.mouseButtons.PAN) {
                                if (scope.enablePan === !1) return;
                                state = STATE.PAN, panStart.set(event.clientX, event.clientY)
                            }
                            state !== STATE.NONE && (document.addEventListener("mousemove", onMouseMove, !1), document.addEventListener("mouseup", onMouseUp, !1), scope.dispatchEvent(startEvent))
                        }
                    }

                    function onMouseMove(event) {
                        if (scope.enabled !== !1) {
                            event.preventDefault();
                            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                            if (state === STATE.ROTATE) {
                                if (scope.enableRotate === !1) return;
                                rotateEnd.set(event.clientX, event.clientY), rotateDelta.subVectors(rotateEnd, rotateStart), constraint.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed), constraint.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed), rotateStart.copy(rotateEnd)
                            } else if (state === STATE.DOLLY) {
                                if (scope.enableZoom === !1) return;
                                dollyEnd.set(event.clientX, event.clientY), dollyDelta.subVectors(dollyEnd, dollyStart), dollyDelta.y > 0 ? constraint.dollyIn(getZoomScale()) : dollyDelta.y < 0 && constraint.dollyOut(getZoomScale()), dollyStart.copy(dollyEnd)
                            } else if (state === STATE.PAN) {
                                if (scope.enablePan === !1) return;
                                panEnd.set(event.clientX, event.clientY), panDelta.subVectors(panEnd, panStart), pan(panDelta.x, panDelta.y), panStart.copy(panEnd)
                            }
                            state !== STATE.NONE && scope.update()
                        }
                    }

                    function onMouseUp() {
                        scope.enabled !== !1 && (document.removeEventListener("mousemove", onMouseMove, !1), document.removeEventListener("mouseup", onMouseUp, !1), scope.dispatchEvent(endEvent), state = STATE.NONE)
                    }

                    function onMouseWheel(event) {
                        if (scope.enabled !== !1 && scope.enableZoom !== !1 && state === STATE.NONE) {
                            event.preventDefault(), event.stopPropagation();
                            var delta = 0;
                            void 0 !== event.wheelDelta ? delta = event.wheelDelta : void 0 !== event.detail && (delta = -event.detail), delta > 0 ? constraint.dollyOut(getZoomScale()) : 0 > delta && constraint.dollyIn(getZoomScale()), scope.update(), scope.dispatchEvent(startEvent), scope.dispatchEvent(endEvent)
                        }
                    }

                    function onKeyDown(event) {
                        if (scope.enabled !== !1 && scope.enableKeys !== !1 && scope.enablePan !== !1) switch (event.keyCode) {
                            case scope.keys.UP:
                                pan(0, scope.keyPanSpeed), scope.update();
                                break;
                            case scope.keys.BOTTOM:
                                pan(0, -scope.keyPanSpeed), scope.update();
                                break;
                            case scope.keys.LEFT:
                                pan(scope.keyPanSpeed, 0), scope.update();
                                break;
                            case scope.keys.RIGHT:
                                pan(-scope.keyPanSpeed, 0), scope.update()
                        }
                    }

                    function touchstart(event) {
                        if (scope.enabled !== !1) {
                            switch (event.touches.length) {
                                case 1:
                                    if (scope.enableRotate === !1) return;
                                    state = STATE.TOUCH_ROTATE, rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                                    break;
                                case 2:
                                    if (scope.enableZoom === !1) return;
                                    state = STATE.TOUCH_DOLLY;
                                    var dx = event.touches[0].pageX - event.touches[1].pageX,
                                        dy = event.touches[0].pageY - event.touches[1].pageY,
                                        distance = Math.sqrt(dx * dx + dy * dy);
                                    dollyStart.set(0, distance);
                                    break;
                                case 3:
                                    if (scope.enablePan === !1) return;
                                    state = STATE.TOUCH_PAN, panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                                    break;
                                default:
                                    state = STATE.NONE
                            }
                            state !== STATE.NONE && scope.dispatchEvent(startEvent)
                        }
                    }

                    function touchmove(event) {
                        if (scope.enabled !== !1) {
                            event.preventDefault(), event.stopPropagation();
                            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
                            switch (event.touches.length) {
                                case 1:
                                    if (scope.enableRotate === !1) return;
                                    if (state !== STATE.TOUCH_ROTATE) return;
                                    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY), rotateDelta.subVectors(rotateEnd, rotateStart), constraint.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed), constraint.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed), rotateStart.copy(rotateEnd), scope.update();
                                    break;
                                case 2:
                                    if (scope.enableZoom === !1) return;
                                    if (state !== STATE.TOUCH_DOLLY) return;
                                    var dx = event.touches[0].pageX - event.touches[1].pageX,
                                        dy = event.touches[0].pageY - event.touches[1].pageY,
                                        distance = Math.sqrt(dx * dx + dy * dy);
                                    dollyEnd.set(0, distance), dollyDelta.subVectors(dollyEnd, dollyStart), dollyDelta.y > 0 ? constraint.dollyOut(getZoomScale()) : dollyDelta.y < 0 && constraint.dollyIn(getZoomScale()), dollyStart.copy(dollyEnd), scope.update();
                                    break;
                                case 3:
                                    if (scope.enablePan === !1) return;
                                    if (state !== STATE.TOUCH_PAN) return;
                                    panEnd.set(event.touches[0].pageX, event.touches[0].pageY), panDelta.subVectors(panEnd, panStart), pan(panDelta.x, panDelta.y), panStart.copy(panEnd), scope.update();
                                    break;
                                default:
                                    state = STATE.NONE
                            }
                        }
                    }

                    function touchend() {
                        scope.enabled !== !1 && (scope.dispatchEvent(endEvent), state = STATE.NONE)
                    }

                    function contextmenu(event) {
                        event.preventDefault()
                    }
                    var constraint = new OrbitConstraint(object);
                    this.domElement = void 0 !== domElement ? domElement : document, Object.defineProperty(this, "constraint", {
                        get: function () {
                            return constraint
                        }
                    }), this.getPolarAngle = function () {
                        return constraint.getPolarAngle()
                    }, this.getAzimuthalAngle = function () {
                        return constraint.getAzimuthalAngle()
                    }, this.enabled = !0, this.center = this.target, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.enablePan = !0, this.keyPanSpeed = 7, this.autoRotate = !1, this.autoRotateSpeed = 2, this.enableKeys = !0, this.keys = {
                        LEFT: 37,
                        UP: 38,
                        RIGHT: 39,
                        BOTTOM: 40
                    }, this.mouseButtons = {
                        ORBIT: THREE.MOUSE.LEFT,
                        ZOOM: THREE.MOUSE.MIDDLE,
                        PAN: THREE.MOUSE.RIGHT
                    };
                    var scope = this,
                        rotateStart = new THREE.Vector2,
                        rotateEnd = new THREE.Vector2,
                        rotateDelta = new THREE.Vector2,
                        panStart = new THREE.Vector2,
                        panEnd = new THREE.Vector2,
                        panDelta = new THREE.Vector2,
                        dollyStart = new THREE.Vector2,
                        dollyEnd = new THREE.Vector2,
                        dollyDelta = new THREE.Vector2,
                        STATE = {
                            NONE: -1,
                            ROTATE: 0,
                            DOLLY: 1,
                            PAN: 2,
                            TOUCH_ROTATE: 3,
                            TOUCH_DOLLY: 4,
                            TOUCH_PAN: 5
                        },
                        state = STATE.NONE;
                    this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom;
                    var changeEvent = {
                            type: "change"
                        },
                        startEvent = {
                            type: "start"
                        },
                        endEvent = {
                            type: "end"
                        };
                    this.update = function () {
                        this.autoRotate && state === STATE.NONE && constraint.rotateLeft(getAutoRotationAngle()), constraint.update() === !0 && this.dispatchEvent(changeEvent)
                    }, this.reset = function () {
                        state = STATE.NONE, this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(changeEvent), this.update()
                    }, this.dispose = function () {
                        this.domElement.removeEventListener("contextmenu", contextmenu, !1), this.domElement.removeEventListener("mousedown", onMouseDown, !1), this.domElement.removeEventListener("mousewheel", onMouseWheel, !1), this.domElement.removeEventListener("MozMousePixelScroll", onMouseWheel, !1), this.domElement.removeEventListener("touchstart", touchstart, !1), this.domElement.removeEventListener("touchend", touchend, !1), this.domElement.removeEventListener("touchmove", touchmove, !1), document.removeEventListener("mousemove", onMouseMove, !1), document.removeEventListener("mouseup", onMouseUp, !1), window.removeEventListener("keydown", onKeyDown, !1)
                    }, this.domElement.addEventListener("contextmenu", contextmenu, !1), this.domElement.addEventListener("mousedown", onMouseDown, !1), this.domElement.addEventListener("mousewheel", onMouseWheel, !1), this.domElement.addEventListener("MozMousePixelScroll", onMouseWheel, !1), this.domElement.addEventListener("touchstart", touchstart, !1), this.domElement.addEventListener("touchend", touchend, !1), this.domElement.addEventListener("touchmove", touchmove, !1), window.addEventListener("keydown", onKeyDown, !1), this.update()
                }
                var MOUSE = THREE.MOUSE;
                return MOUSE || (MOUSE = {
                    LEFT: 0,
                    MIDDLE: 1,
                    RIGHT: 2
                }), OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype), OrbitControls.prototype.constructor = OrbitControls, Object.defineProperties(OrbitControls.prototype, {
                    object: {
                        get: function () {
                            return this.constraint.object
                        }
                    },
                    target: {
                        get: function () {
                            return this.constraint.target
                        },
                        set: function (value) {
                            console.warn("THREE.OrbitControls: target is now immutable. Use target.set() instead."), this.constraint.target.copy(value)
                        }
                    },
                    minDistance: {
                        get: function () {
                            return this.constraint.minDistance
                        },
                        set: function (value) {
                            this.constraint.minDistance = value
                        }
                    },
                    maxDistance: {
                        get: function () {
                            return this.constraint.maxDistance
                        },
                        set: function (value) {
                            this.constraint.maxDistance = value
                        }
                    },
                    minZoom: {
                        get: function () {
                            return this.constraint.minZoom
                        },
                        set: function (value) {
                            this.constraint.minZoom = value
                        }
                    },
                    maxZoom: {
                        get: function () {
                            return this.constraint.maxZoom
                        },
                        set: function (value) {
                            this.constraint.maxZoom = value
                        }
                    },
                    minPolarAngle: {
                        get: function () {
                            return this.constraint.minPolarAngle
                        },
                        set: function (value) {
                            this.constraint.minPolarAngle = value
                        }
                    },
                    maxPolarAngle: {
                        get: function () {
                            return this.constraint.maxPolarAngle
                        },
                        set: function (value) {
                            this.constraint.maxPolarAngle = value
                        }
                    },
                    minAzimuthAngle: {
                        get: function () {
                            return this.constraint.minAzimuthAngle
                        },
                        set: function (value) {
                            this.constraint.minAzimuthAngle = value
                        }
                    },
                    maxAzimuthAngle: {
                        get: function () {
                            return this.constraint.maxAzimuthAngle
                        },
                        set: function (value) {
                            this.constraint.maxAzimuthAngle = value
                        }
                    },
                    enableDamping: {
                        get: function () {
                            return this.constraint.enableDamping
                        },
                        set: function (value) {
                            this.constraint.enableDamping = value
                        }
                    },
                    dampingFactor: {
                        get: function () {
                            return this.constraint.dampingFactor
                        },
                        set: function (value) {
                            this.constraint.dampingFactor = value
                        }
                    },
                    noZoom: {
                        get: function () {
                            return console.warn("THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."), !this.enableZoom
                        },
                        set: function (value) {
                            console.warn("THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead."), this.enableZoom = !value
                        }
                    },
                    noRotate: {
                        get: function () {
                            return console.warn("THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."), !this.enableRotate
                        },
                        set: function (value) {
                            console.warn("THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead."), this.enableRotate = !value
                        }
                    },
                    noPan: {
                        get: function () {
                            return console.warn("THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."), !this.enablePan
                        },
                        set: function (value) {
                            console.warn("THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead."), this.enablePan = !value
                        }
                    },
                    noKeys: {
                        get: function () {
                            return console.warn("THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."), !this.enableKeys
                        },
                        set: function (value) {
                            console.warn("THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead."), this.enableKeys = !value
                        }
                    },
                    staticMoving: {
                        get: function () {
                            return console.warn("THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."), !this.constraint.enableDamping
                        },
                        set: function (value) {
                            console.warn("THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead."), this.constraint.enableDamping = !value
                        }
                    },
                    dynamicDampingFactor: {
                        get: function () {
                            return console.warn("THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."), this.constraint.dampingFactor
                        },
                        set: function (value) {
                            console.warn("THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead."), this.constraint.dampingFactor = value
                        }
                    }
                }), OrbitControls
            }
        }, {}],
        11: [function (require, module, exports) {
            "use strict";

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                Clock = function (_THREE$Clock) {
                    function Clock() {
                        return _classCallCheck(this, Clock), _possibleConstructorReturn(this, (Clock.__proto__ || Object.getPrototypeOf(Clock)).call(this, !0))
                    }
                    return _inherits(Clock, _THREE$Clock), _createClass(Clock, [{
                        key: "delta",
                        get: function () {
                            return this.getDelta()
                        }
                    }, {
                        key: "time",
                        get: function () {
                            return this.getElapsedTime()
                        }
                    }]), Clock
                }(THREE.Clock);
            exports["default"] = Clock
        }, {}],
        12: [function () {
            "use strict";

            function FBXNodes() {}

            function FBXParser() {}

            function FBXAnalyzer() {}

            function Weights() {
                this.skinIndices = [], this.skinWeights = [], this.matrices = []
            }

            function Bones() {
                this.hierarchy = []
            }

            function Geometry() {
                this.node = null, this.name = null, this.id = null, this.vertices = [], this.indices = [], this.normals = [], this.uvs = [], this.bones = [], this.skins = null
            }

            function UV() {
                this.uv = null, this.map = null, this.ref = null, this.node = null, this.index = null
            }

            function Normal() {
                this.normal = null, this.map = null, this.ref = null, this.node = null, this.index = null
            }

            function AnimationCurve() {
                this.version = null, this.id = null, this.internalId = null, this.times = null, this.values = null, this.attrFlag = null, this.attrData = null
            }

            function AnimationNode() {
                this.id = null, this.attr = null, this.attrX = !1, this.attrY = !1, this.attrZ = !1, this.internalId = null, this.containerInternalId = null, this.containerBoneId = null, this.curveIdx = null, this.curves = []
            }

            function Animation() {
                this.curves = {}, this.length = 0, this.fps = 30, this.frames = 0
            }

            function Textures() {
                this.textures = [], this.perGeoMap = {}
            }

            function Texture() {
                this.fileName = "", this.name = "", this.id = null, this.parentIds = []
            }

            function parse_Data_ByPolygonVertex_IndexToDirect(node, indices, itemSize) {
                for (var res = [], i = 0; i < indices.length; ++i)
                    for (var j = 0; itemSize > j; ++j) res.push(node[indices[i] * itemSize + j]);
                return res
            }

            function mapByPolygonVertexToByVertex(data, indices, stride) {
                for (var tmp = {}, res = [], max = 0, i = 0; i < indices.length; ++i)
                    if (!(indices[i] in tmp)) {
                        tmp[indices[i]] = {};
                        for (var j = 0; stride > j; ++j) tmp[indices[i]][j] = data[i * stride + j];
                        max = max < indices[i] ? indices[i] : max
                    }
                try {
                    for (i = 0; max >= i; i++)
                        for (var s = 0; stride > s; s++) res.push(tmp[i][s])
                } catch (e) {}
                return res
            }
            THREE.FBXLoader = function (manager) {
                THREE.Loader.call(this), this.manager = void 0 !== manager ? manager : THREE.DefaultLoadingManager, this.textureLoader = null, this.textureBasePath = null
            }, THREE.FBXLoader.prototype = Object.create(THREE.Loader.prototype), THREE.FBXLoader.prototype.constructor = THREE.FBXLoader, THREE.FBXLoader.prototype.load = function (url, onLoad, onProgress, onError) {
                var scope = this,
                    loader = new THREE.XHRLoader(scope.manager);
                loader.load(url, function (text) {
                    scope.isFbxFormatASCII(text) ? scope.isFbxVersionSupported(text) ? (scope.textureBasePath = scope.extractUrlBase(url), onLoad(scope.parse(text))) : console.warn("FBXLoader: !!! FBX Version below 7 not supported !!!") : console.warn("FBXLoader: !!! FBX Binary format not supported !!!")
                }, onProgress, onError)
            }, THREE.FBXLoader.prototype.setCrossOrigin = function (value) {
                this.crossOrigin = value
            }, THREE.FBXLoader.prototype.isFbxFormatASCII = function (body) {
                for (var CORRECT = ["K", "a", "y", "d", "a", "r", "a", "\\", "F", "B", "X", "\\", "B", "i", "n", "a", "r", "y", "\\", "\\"], cursor = 0, read = function (offset) {
                        var result = body[offset - 1];
                        return body = body.slice(cursor + offset), cursor++, result
                    }, i = 0; i < CORRECT.length; ++i) {
                    var num = read(1);
                    if (num == CORRECT[i]) return !1
                }
                return !0
            }, THREE.FBXLoader.prototype.isFbxVersionSupported = function (body) {
                var versionExp = /FBXVersion: (\d+)/,
                    match = body.match(versionExp);
                if (match) {
                    var version = parseInt(match[1]);
                    return version >= 7e3
                }
                return !1
            }, THREE.FBXLoader.prototype.parse = function (text) {
                var scope = this,
                    nodes = (new FBXParser).parse(text);
                scope.hierarchy = (new Bones).parseHierarchy(nodes), scope.weights = (new Weights).parse(nodes, scope.hierarchy), scope.animations = (new Animation).parse(nodes, scope.hierarchy), scope.textures = (new Textures).parse(nodes, scope.hierarchy);
                for (var geometries = this.parseGeometries(nodes), container = new THREE.Group, i = 0; i < geometries.length; ++i) void 0 !== geometries[i] && container.add(geometries[i]);
                return container
            }, THREE.FBXLoader.prototype.parseGeometries = function (node) {
                if (!("Geometry" in node.Objects.subNodes)) return [];
                var geoCount = 0;
                for (var geo in node.Objects.subNodes.Geometry) geo.match(/^\d+$/) && geoCount++;
                var res = [];
                if (geoCount > 0)
                    for (geo in node.Objects.subNodes.Geometry) "Mesh" === node.Objects.subNodes.Geometry[geo].attrType && res.push(this.parseGeometry(node.Objects.subNodes.Geometry[geo], node));
                else res.push(this.parseGeometry(node.Objects.subNodes.Geometry, node));
                return res
            }, THREE.FBXLoader.prototype.parseGeometry = function (node, nodes) {
                var geo = (new Geometry).parse(node);
                geo.addBones(this.hierarchy.hierarchy);
                var geometry = new THREE.BufferGeometry;
                geometry.name = geo.name, geometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(geo.vertices), 3)), void 0 !== geo.normals && geo.normals.length > 0 && geometry.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(geo.normals), 3)), void 0 !== geo.uvs && geo.uvs.length > 0 && geometry.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(geo.uvs), 2)), void 0 !== geo.indices && geo.indices.length > 65535 ? geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(geo.indices), 1)) : void 0 !== geo.indices && geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(geo.indices), 1)), geometry.verticesNeedUpdate = !0, geometry.computeBoundingSphere(), geometry.computeBoundingBox();
                var texture, texs = this.textures.getById(nodes.searchConnectionParent(geo.id));
                void 0 !== texs && texs.length > 0 && (null === this.textureLoader && (this.textureLoader = new THREE.TextureLoader), texture = this.textureLoader.load(this.textureBasePath + "/" + texs[0].fileName));
                var material;
                material = new THREE.MeshBasicMaterial(void 0 !== texture ? {
                    map: texture
                } : {
                    color: 3342591
                }), geometry = (new THREE.Geometry).fromBufferGeometry(geometry), geometry.bones = geo.bones, geometry.skinIndices = this.weights.skinIndices, geometry.skinWeights = this.weights.skinWeights;
                var mesh = null;
                return void 0 === geo.bones || void 0 === geo.skins || void 0 === this.animations || 0 === this.animations.length ? mesh = new THREE.Mesh(geometry, material) : (material.skinning = !0, mesh = new THREE.SkinnedMesh(geometry, material), this.addAnimation(mesh, this.weights.matrices, this.animations)), mesh
            }, THREE.FBXLoader.prototype.addAnimation = function (mesh, matrices, animations) {
                for (var animationdata = {
                        name: "animationtest",
                        fps: 30,
                        length: animations.length,
                        hierarchy: []
                    }, i = 0; i < mesh.geometry.bones.length; ++i) {
                    var name = mesh.geometry.bones[i].name;
                    name = name.replace(/.*:/, ""), animationdata.hierarchy.push({
                        parent: mesh.geometry.bones[i].parent,
                        name: name,
                        keys: []
                    })
                }
                var hasCurve = function (animNode, attr) {
                        if (void 0 === animNode) return !1;
                        var attrNode;
                        switch (attr) {
                            case "S":
                                if (void 0 === animNode.S) return !1;
                                attrNode = animNode.S;
                                break;
                            case "R":
                                if (void 0 === animNode.R) return !1;
                                attrNode = animNode.R;
                                break;
                            case "T":
                                if (void 0 === animNode.T) return !1;
                                attrNode = animNode.T
                        }
                        return void 0 === attrNode.curves.x ? !1 : void 0 === attrNode.curves.y ? !1 : void 0 === attrNode.curves.z ? !1 : !0
                    },
                    hasKeyOnFrame = function (attrNode, frame) {
                        var x = isKeyExistOnFrame(attrNode.curves.x, frame),
                            y = isKeyExistOnFrame(attrNode.curves.y, frame),
                            z = isKeyExistOnFrame(attrNode.curves.z, frame);
                        return x && y && z
                    },
                    isKeyExistOnFrame = function (curve, frame) {
                        var value = curve.values[frame];
                        return void 0 !== value
                    },
                    genKey = function (animNode, bone) {
                        var key = {};
                        if (key.time = frame / animations.fps, key.pos = bone.pos, key.rot = bone.rotq, key.scl = bone.scl, void 0 === animNode) return key;
                        try {
                            if (hasCurve(animNode, "T") && hasKeyOnFrame(animNode.T, frame)) {
                                var pos = new THREE.Vector3(animNode.T.curves.x.values[frame], animNode.T.curves.y.values[frame], animNode.T.curves.z.values[frame]);
                                key.pos = [pos.x, pos.y, pos.z]
                            } else delete key.pos;
                            if (hasCurve(animNode, "R") && hasKeyOnFrame(animNode.R, frame)) {
                                var rx = degToRad(animNode.R.curves.x.values[frame]),
                                    ry = degToRad(animNode.R.curves.y.values[frame]),
                                    rz = degToRad(animNode.R.curves.z.values[frame]),
                                    eul = new THREE.Vector3(rx, ry, rz),
                                    rot = quatFromVec(eul.x, eul.y, eul.z);
                                key.rot = [rot.x, rot.y, rot.z, rot.w]
                            } else delete key.rot;
                            if (hasCurve(animNode, "S") && hasKeyOnFrame(animNode.S, frame)) {
                                var scl = new THREE.Vector3(animNode.S.curves.x.values[frame], animNode.S.curves.y.values[frame], animNode.S.curves.z.values[frame]);
                                key.scl = [scl.x, scl.y, scl.z]
                            } else delete key.scl
                        } catch (e) {
                            console.log(bone), console.log(e)
                        }
                        return key
                    },
                    bones = mesh.geometry.bones;
                for (frame = 0; frame < animations.frames; frame++)
                    for (i = 0; i < bones.length; i++)
                        for (var bone = bones[i], animNode = animations.curves[i], j = 0; j < animationdata.hierarchy.length; j++) animationdata.hierarchy[j].name === bone.name && animationdata.hierarchy[j].keys.push(genKey(animNode, bone));
                void 0 === mesh.geometry.animations && (mesh.geometry.animations = []), mesh.geometry.animations.push(THREE.AnimationClip.parseAnimation(animationdata, mesh.geometry.bones))
            }, THREE.FBXLoader.prototype.parseMaterials = function (node) {
                if (!("Material" in node.subNodes)) return [];
                var matCount = 0;
                for (var mat in node.subNodes.Materials) mat.match(/^\d+$/) && matCount++;
                var res = [];
                if (matCount > 0)
                    for (mat in node.subNodes.Material) res.push(parseMaterial(node.subNodes.Material[mat]));
                else res.push(parseMaterial(node.subNodes.Material));
                return res
            }, THREE.FBXLoader.prototype.parseMaterial = function () {}, THREE.FBXLoader.prototype.loadFile = function (url, onLoad, onProgress, onError, responseType) {
                var loader = new THREE.XHRLoader(this.manager);
                loader.setResponseType(responseType);
                var request = loader.load(url, function (result) {
                    onLoad(result)
                }, onProgress, onError);
                return request
            }, THREE.FBXLoader.prototype.loadFileAsBuffer = function (url, onload, onProgress, onError) {
                this.loadFile(url, onLoad, onProgress, onError, "arraybuffer")
            }, THREE.FBXLoader.prototype.loadFileAsText = function (url, onLoad, onProgress, onError) {
                this.loadFile(url, onLoad, onProgress, onError, "text")
            }, FBXNodes.prototype.add = function (key, val) {
                this[key] = val
            }, FBXNodes.prototype.searchConnectionParent = function (id) {
                if (void 0 === this.__cache_search_connection_parent && (this.__cache_search_connection_parent = []), void 0 !== this.__cache_search_connection_parent[id]) return this.__cache_search_connection_parent[id];
                this.__cache_search_connection_parent[id] = [];
                for (var conns = this.Connections.properties.connections, results = [], i = 0; i < conns.length; ++i)
                    if (conns[i][0] == id) {
                        var res = 0 === conns[i][1] ? -1 : conns[i][1];
                        results.push(res)
                    }
                return results.length > 0 ? (this.__cache_search_connection_parent[id] = this.__cache_search_connection_parent[id].concat(results), results) : (this.__cache_search_connection_parent[id] = [-1], [-1])
            }, FBXNodes.prototype.searchConnectionChildren = function (id) {
                if (void 0 === this.__cache_search_connection_children && (this.__cache_search_connection_children = []), void 0 !== this.__cache_search_connection_children[id]) return this.__cache_search_connection_children[id];
                this.__cache_search_connection_children[id] = [];
                for (var conns = this.Connections.properties.connections, res = [], i = 0; i < conns.length; ++i) conns[i][1] == id && res.push(0 === conns[i][0] ? -1 : conns[i][0]);
                return res.length > 0 ? (this.__cache_search_connection_children[id] = this.__cache_search_connection_children[id].concat(res), res) : (this.__cache_search_connection_children[id] = [-1], [-1])
            }, FBXNodes.prototype.searchConnectionType = function (id, to) {
                var key = id + "," + to;
                if (void 0 === this.__cache_search_connection_type && (this.__cache_search_connection_type = ""), void 0 !== this.__cache_search_connection_type[key]) return this.__cache_search_connection_type[key];
                this.__cache_search_connection_type[key] = "";
                for (var conns = this.Connections.properties.connections, i = 0; i < conns.length; ++i)
                    if (conns[i][0] == id && conns[i][1] == to) return this.__cache_search_connection_type[key] = conns[i][2], conns[i][2];
                return this.__cache_search_connection_type[id] = null, null
            }, FBXParser.prototype = {
                getPrevNode: function () {
                    return this.nodeStack[this.currentIndent - 2]
                },
                getCurrentNode: function () {
                    return this.nodeStack[this.currentIndent - 1]
                },
                getCurrentProp: function () {
                    return this.currentProp
                },
                pushStack: function (node) {
                    this.nodeStack.push(node), this.currentIndent += 1
                },
                popStack: function () {
                    this.nodeStack.pop(), this.currentIndent -= 1
                },
                setCurrentProp: function (val, name) {
                    this.currentProp = val, this.currentPropName = name
                },
                parse: function (text) {
                    this.currentIndent = 0, this.allNodes = new FBXNodes, this.nodeStack = [], this.currentProp = [], this.currentPropName = "";
                    var split = text.split("\n");
                    for (var line in split) {
                        var l = split[line];
                        if (!l.match(/^[\s\t]*;/) && !l.match(/^[\s\t]*$/)) {
                            var beginningOfNodeExp = new RegExp("^\\t{" + this.currentIndent + "}(\\w+):(.*){", ""),
                                match = l.match(beginningOfNodeExp);
                            if (match) {
                                var nodeName = match[1].trim().replace(/^"/, "").replace(/"$/, ""),
                                    nodeAttrs = match[2].split(",").map(function (element) {
                                        return element.trim().replace(/^"/, "").replace(/"$/, "")
                                    });
                                this.parseNodeBegin(l, nodeName, nodeAttrs || null)
                            } else {
                                var propExp = new RegExp("^\\t{" + this.currentIndent + "}(\\w+):[\\s\\t\\r\\n](.*)"),
                                    match = l.match(propExp);
                                if (match) {
                                    var propName = match[1].replace(/^"/, "").replace(/"$/, "").trim(),
                                        propValue = match[2].replace(/^"/, "").replace(/"$/, "").trim();
                                    this.parseNodeProperty(l, propName, propValue)
                                } else {
                                    var endOfNodeExp = new RegExp("^\\t{" + (this.currentIndent - 1) + "}}");
                                    l.match(endOfNodeExp) ? this.nodeEnd() : l.match(/^[^\s\t}]/) && this.parseNodePropertyContinued(l)
                                }
                            }
                        }
                    }
                    return this.allNodes
                },
                parseNodeBegin: function (line, nodeName, nodeAttrs) {
                    var node = {
                            name: nodeName,
                            properties: {},
                            subNodes: {}
                        },
                        attrs = this.parseNodeAttr(nodeAttrs),
                        currentNode = this.getCurrentNode();
                    if (0 === this.currentIndent) this.allNodes.add(nodeName, node);
                    else if (nodeName in currentNode.subNodes) {
                        var tmp = currentNode.subNodes[nodeName];
                        this.isFlattenNode(currentNode.subNodes[nodeName]) && ("" === attrs.id ? (currentNode.subNodes[nodeName] = [], currentNode.subNodes[nodeName].push(tmp)) : (currentNode.subNodes[nodeName] = {}, currentNode.subNodes[nodeName][tmp.id] = tmp)), "" === attrs.id ? currentNode.subNodes[nodeName].push(node) : currentNode.subNodes[nodeName][attrs.id] = node
                    } else currentNode.subNodes[nodeName] = node;
                    nodeAttrs && (node.id = attrs.id, node.attrName = attrs.name, node.attrType = attrs.type), this.pushStack(node)
                },
                parseNodeAttr: function (attrs) {
                    var id = attrs[0];
                    "" !== attrs[0] && (id = parseInt(attrs[0]), isNaN(id) && (id = attrs[0]));
                    var name, type;
                    return attrs.length > 1 && (name = attrs[1].replace(/^(\w+)::/, ""), type = attrs[2]), {
                        id: id,
                        name: name || "",
                        type: type || ""
                    }
                },
                parseNodeProperty: function (line, propName, propValue) {
                    var currentNode = this.getCurrentNode(),
                        parentName = currentNode.name;
                    if (void 0 !== parentName) {
                        var propMatch = parentName.match(/Properties(\d)+/);
                        if (propMatch) return void this.parseNodeSpecialProperty(line, propName, propValue)
                    }
                    if ("C" == propName) {
                        var connProps = propValue.split(",").slice(1),
                            from = parseInt(connProps[0]),
                            to = parseInt(connProps[1]),
                            rest = propValue.split(",").slice(3);
                        propName = "connections", propValue = [from, to], propValue = propValue.concat(rest), void 0 === currentNode.properties[propName] && (currentNode.properties[propName] = [])
                    }
                    if ("Node" == propName) {
                        var id = parseInt(propValue);
                        currentNode.properties.id = id, currentNode.id = id
                    }
                    propName in currentNode.properties ? Array.isArray(currentNode.properties[propName]) ? currentNode.properties[propName].push(propValue) : currentNode.properties[propName] += propValue : Array.isArray(currentNode.properties[propName]) ? currentNode.properties[propName].push(propValue) : currentNode.properties[propName] = propValue, this.setCurrentProp(currentNode.properties, propName)
                },
                parseNodePropertyContinued: function (line) {
                    this.currentProp[this.currentPropName] += line
                },
                parseNodeSpecialProperty: function (line, propName, propValue) {
                    var props = propValue.split('",').map(function (element) {
                            return element.trim().replace(/^\"/, "").replace(/\s/, "_")
                        }),
                        innerPropName = props[0],
                        innerPropType1 = props[1],
                        innerPropType2 = props[2],
                        innerPropFlag = props[3],
                        innerPropValue = props[4];
                    switch (innerPropType1) {
                        case "int":
                            innerPropValue = parseInt(innerPropValue);
                            break;
                        case "double":
                            innerPropValue = parseFloat(innerPropValue);
                            break;
                        case "ColorRGB":
                        case "Vector3D":
                            var tmp = innerPropValue.split(",");
                            innerPropValue = new THREE.Vector3(tmp[0], tmp[1], tmp[2])
                    }
                    this.getPrevNode().properties[innerPropName] = {
                        type: innerPropType1,
                        type2: innerPropType2,
                        flag: innerPropFlag,
                        value: innerPropValue
                    }, this.setCurrentProp(this.getPrevNode().properties, innerPropName)
                },
                nodeEnd: function () {
                    this.popStack()
                },
                isFlattenNode: function (node) {
                    return "subNodes" in node && "properties" in node ? !0 : !1
                }
            }, FBXAnalyzer.prototype = {}, Weights.prototype.parseCluster = function (node, id, entry) {
                var _p = node.searchConnectionParent(id),
                    _indices = toInt(entry.subNodes.Indexes.properties.a.split(",")),
                    _weights = toFloat(entry.subNodes.Weights.properties.a.split(",")),
                    _transform = toMat44(toFloat(entry.subNodes.Transform.properties.a.split(","))),
                    _link = toMat44(toFloat(entry.subNodes.TransformLink.properties.a.split(",")));
                return {
                    parent: _p,
                    id: parseInt(id),
                    indices: _indices,
                    weights: _weights,
                    transform: _transform,
                    transformlink: _link,
                    linkMode: entry.properties.Mode
                }
            }, Weights.prototype.parse = function (node, bones) {
                this.skinIndices = [], this.skinWeights = [], this.matrices = [];
                var deformers = node.Objects.subNodes.Deformer,
                    clusters = {};
                for (var id in deformers)
                    if ("Cluster" === deformers[id].attrType) {
                        if (!("Indexes" in deformers[id].subNodes)) continue;
                        var cluster = this.parseCluster(node, id, deformers[id]),
                            boneId = node.searchConnectionChildren(cluster.id)[0];
                        clusters[boneId] = cluster
                    }
                for (var weights = [], hi = bones.hierarchy, b = 0; b < hi.length; ++b) {
                    var bid = hi[b].internalId;
                    if (void 0 !== clusters[bid]) {
                        var clst = clusters[bid];
                        this.matrices.push(clst.transform);
                        for (var v = 0; v < clst.indices.length; ++v) {
                            void 0 === weights[clst.indices[v]] && (weights[clst.indices[v]] = {}, weights[clst.indices[v]].joint = [], weights[clst.indices[v]].weight = []);
                            var affect = node.searchConnectionChildren(clst.id);
                            affect.length > 1 && console.warn("FBXLoader: node " + clst.id + " have many weight kids: " + affect), weights[clst.indices[v]].joint.push(bones.getBoneIdfromInternalId(node, affect[0])), weights[clst.indices[v]].weight.push(clst.weights[v])
                        }
                    } else this.matrices.push(new THREE.Matrix4)
                }
                for (var i = 0; i < weights.length; i++) {
                    var indicies = new THREE.Vector4(weights[i].joint[0] ? weights[i].joint[0] : 0, weights[i].joint[1] ? weights[i].joint[1] : 0, weights[i].joint[2] ? weights[i].joint[2] : 0, weights[i].joint[3] ? weights[i].joint[3] : 0),
                        weight = new THREE.Vector4(weights[i].weight[0] ? weights[i].weight[0] : 0, weights[i].weight[1] ? weights[i].weight[1] : 0, weights[i].weight[2] ? weights[i].weight[2] : 0, weights[i].weight[3] ? weights[i].weight[3] : 0);
                    this.skinIndices.push(indicies), this.skinWeights.push(weight)
                }
                return this
            }, Bones.prototype.parseHierarchy = function (node) {
                var objects = node.Objects,
                    models = objects.subNodes.Model,
                    bones = [];
                for (var id in models) void 0 !== models[id].attrType && bones.push(models[id]);
                this.hierarchy = [];
                for (var i = 0; i < bones.length; ++i) {
                    var bone = bones[i],
                        p = node.searchConnectionParent(bone.id)[0],
                        t = [0, 0, 0],
                        r = [0, 0, 0, 1],
                        s = [1, 1, 1];
                    if ("Lcl_Translation" in bone.properties && (t = toFloat(bone.properties.Lcl_Translation.value.split(","))), "Lcl_Rotation" in bone.properties) {
                        r = toRad(toFloat(bone.properties.Lcl_Rotation.value.split(",")));
                        var q = new THREE.Quaternion;
                        q.setFromEuler(new THREE.Euler(r[0], r[1], r[2], "ZYX")), r = [q.x, q.y, q.z, q.w]
                    }
                    "Lcl_Scaling" in bone.properties && (s = toFloat(bone.properties.Lcl_Scaling.value.split(",")));
                    var name = bone.attrName;
                    name = name.replace(/:/, ""), name = name.replace(/-/, ""), this.hierarchy.push({
                        parent: p,
                        name: name,
                        pos: t,
                        rotq: r,
                        scl: s,
                        internalId: bone.id
                    })
                }
                return this.reindexParentId(), this.restoreBindPose(node), this
            }, Bones.prototype.reindexParentId = function () {
                for (var h = 0; h < this.hierarchy.length; h++)
                    for (var ii = 0; ii < this.hierarchy.length; ++ii)
                        if (this.hierarchy[h].parent == this.hierarchy[ii].internalId) {
                            this.hierarchy[h].parent = ii;
                            break
                        }
            }, Bones.prototype.restoreBindPose = function (node) {
                var bindPoseNode = node.Objects.subNodes.Pose;
                if (void 0 !== bindPoseNode) {
                    for (var poseNode = bindPoseNode.subNodes.PoseNode, localMatrices = {}, worldMatrices = {}, i = 0; i < poseNode.length; ++i) {
                        var rawMatLcl = toMat44(poseNode[i].subNodes.Matrix.properties.a.split(",")),
                            rawMatWrd = toMat44(poseNode[i].subNodes.Matrix.properties.a.split(","));
                        localMatrices[poseNode[i].id] = rawMatLcl, worldMatrices[poseNode[i].id] = rawMatWrd
                    }
                    for (var h = 0; h < this.hierarchy.length; ++h) {
                        var bone = this.hierarchy[h],
                            inId = bone.internalId;
                        if (void 0 !== worldMatrices[inId]) {
                            for (var parentId, t = new THREE.Vector3(0, 0, 0), r = new THREE.Quaternion, s = new THREE.Vector3(1, 1, 1), parentNodes = node.searchConnectionParent(inId), pn = 0; pn < parentNodes.length; ++pn)
                                if (this.isBoneNode(parentNodes[pn])) {
                                    parentId = parentNodes[pn];
                                    break
                                }
                            if (void 0 !== parentId && void 0 !== localMatrices[parentId]) {
                                var inv = new THREE.Matrix4;
                                inv.getInverse(worldMatrices[parentId]), inv.multiply(localMatrices[inId]), localMatrices[inId] = inv
                            }
                            localMatrices[inId].decompose(t, r, s), bone.pos = [t.x, t.y, t.z], bone.rotq = [r.x, r.y, r.z, r.w], bone.scl = [s.x, s.y, s.z]
                        }
                    }
                }
            }, Bones.prototype.searchRealId = function (internalId) {
                for (var h = 0; h < this.hierarchy.length; h++)
                    if (internalId == this.hierarchy[h].internalId) return h;
                return -1
            }, Bones.prototype.getByInternalId = function (internalId) {
                for (var h = 0; h < this.hierarchy.length; h++)
                    if (internalId == this.hierarchy[h].internalId) return this.hierarchy[h];
                return null
            }, Bones.prototype.isBoneNode = function (id) {
                for (var i = 0; i < this.hierarchy.length; ++i)
                    if (id === this.hierarchy[i].internalId) return !0;
                return !1
            }, Bones.prototype.getBoneIdfromInternalId = function (node, id) {
                if (void 0 === node.__cache_get_boneid_from_internalid && (node.__cache_get_boneid_from_internalid = []), void 0 !== node.__cache_get_boneid_from_internalid[id]) return node.__cache_get_boneid_from_internalid[id];
                for (var i = 0; i < this.hierarchy.length; ++i)
                    if (this.hierarchy[i].internalId == id) {
                        return node.__cache_get_boneid_from_internalid[id] = i, i
                    }
                return -1
            }, Geometry.prototype.parse = function (geoNode) {
                return this.node = geoNode, this.name = geoNode.attrName, this.id = geoNode.id, this.vertices = this.getVertices(), void 0 === this.vertices ? void console.log("FBXLoader: Geometry.parse(): pass" + this.node.id) : (this.indices = this.getPolygonVertexIndices(), this.uvs = (new UV).parse(this.node, this), this.normals = (new Normal).parse(this.node, this), this.getPolygonTopologyMax() > 3 && (this.indices = this.convertPolyIndicesToTri(this.indices, this.getPolygonTopologyArray())), this)
            }, Geometry.prototype.getVertices = function () {
                if (this.node.__cache_vertices) return this.node.__cache_vertices;
                if (void 0 === this.node.subNodes.Vertices) return console.warn("this.node: " + this.node.attrName + "(" + this.node.id + ") does not have Vertices"), this.node.__cache_vertices = void 0, null;
                var rawTextVert = this.node.subNodes.Vertices.properties.a,
                    vertices = rawTextVert.split(",").map(function (element) {
                        return parseFloat(element)
                    });
                return this.node.__cache_vertices = vertices, this.node.__cache_vertices
            }, Geometry.prototype.getPolygonVertexIndices = function () {
                if (this.node.__cache_indices && this.node.__cache_poly_topology_max) return this.node.__cache_indices;
                if (void 0 === this.node.subNodes) return console.error("this.node.subNodes undefined"), void console.log(this.node);
                if (void 0 === this.node.subNodes.PolygonVertexIndex) return console.warn("this.node: " + this.node.attrName + "(" + this.node.id + ") does not have PolygonVertexIndex "), void(this.node.__cache_indices = void 0);
                for (var rawTextIndices = this.node.subNodes.PolygonVertexIndex.properties.a, indices = rawTextIndices.split(","), currentTopo = 1, topologyN = null, topologyArr = [], i = 0; i < indices.length; ++i) {
                    var tmpI = parseInt(indices[i]);
                    0 > tmpI ? (currentTopo > topologyN && (topologyN = currentTopo), indices[i] = -1 ^ tmpI, topologyArr.push(currentTopo), currentTopo = 1) : (indices[i] = tmpI, currentTopo++)
                }
                return null === topologyN && (console.warn("FBXLoader: topology N not found: " + this.node.attrName), console.warn(this.node), topologyN = 3), this.node.__cache_poly_topology_max = topologyN, this.node.__cache_poly_topology_arr = topologyArr, this.node.__cache_indices = indices, this.node.__cache_indices
            }, Geometry.prototype.getPolygonTopologyMax = function () {
                return this.node.__cache_indices && this.node.__cache_poly_topology_max ? this.node.__cache_poly_topology_max : (this.getPolygonVertexIndices(this.node), this.node.__cache_poly_topology_max)
            }, Geometry.prototype.getPolygonTopologyArray = function () {
                return this.node.__cache_indices && this.node.__cache_poly_topology_max ? this.node.__cache_poly_topology_arr : (this.getPolygonVertexIndices(this.node), this.node.__cache_poly_topology_arr)
            }, Geometry.prototype.convertPolyIndicesToTri = function (indices, strides) {
                for (var res = [], i = 0, currentPolyNum = 0, currentStride = 0; i < indices.length;) {
                    currentStride = strides[currentPolyNum];
                    for (var j = 0; currentStride - 3 >= j; j++) res.push(indices[i]), res.push(indices[i + (currentStride - 2 - j)]), res.push(indices[i + (currentStride - 1 - j)]);
                    currentPolyNum++, i += currentStride
                }
                return res
            }, Geometry.prototype.addBones = function (bones) {
                this.bones = bones
            }, UV.prototype.getUV = function (node) {
                return this.node && this.uv && this.map && this.ref ? this.uv : this._parseText(node)
            }, UV.prototype.getMap = function (node) {
                return this.node && this.uv && this.map && this.ref ? this.map : (this._parseText(node), this.map)
            }, UV.prototype.getRef = function (node) {
                return this.node && this.uv && this.map && this.ref ? this.ref : (this._parseText(node), this.ref)
            }, UV.prototype.getIndex = function (node) {
                return this.node && this.uv && this.map && this.ref ? this.index : (this._parseText(node), this.index)
            }, UV.prototype.getNode = function (topnode) {
                return null !== this.node ? this.node : (this.node = topnode.subNodes.LayerElementUV, this.node)
            }, UV.prototype._parseText = function (node) {
                var uvNode = this.getNode(node);
                if (void 0 === uvNode) return [];
                var count = 0,
                    x = "";
                for (var n in uvNode) n.match(/^\d+$/) && (count++, x = n);
                count > 0 && (console.warn("multi uv not supported"), uvNode = uvNode[n]);
                var uvIndex = uvNode.subNodes.UVIndex.properties.a,
                    uvs = uvNode.subNodes.UV.properties.a,
                    uvMap = uvNode.properties.MappingInformationType,
                    uvRef = uvNode.properties.ReferenceInformationType;
                return this.uv = toFloat(uvs.split(",")), this.index = toInt(uvIndex.split(",")), this.map = uvMap, this.ref = uvRef, this.uv
            }, UV.prototype.parse = function (node, geo) {
                this.uvNode = this.getNode(node), this.uv = this.getUV(node);
                var mappingType = this.getMap(node),
                    refType = this.getRef(node),
                    indices = this.getIndex(node),
                    strides = geo.getPolygonTopologyArray();
                switch (mappingType) {
                    case "ByPolygonVertex":
                        switch (refType) {
                            case "Direct":
                                this.uv = this.parseUV_ByPolygonVertex_Direct(this.uv, indices, strides, 2);
                                break;
                            case "IndexToDirect":
                                this.uv = this.parseUV_ByPolygonVertex_IndexToDirect(this.uv, indices)
                        }
                        this.uv = mapByPolygonVertexToByVertex(this.uv, geo.getPolygonVertexIndices(node), 2);
                        break;
                    case "ByPolygon":
                        switch (refType) {
                            case "Direct":
                                this.uv = this.parseUV_ByPolygon_Direct();
                                break;
                            case "IndexToDirect":
                                this.uv = this.parseUV_ByPolygon_IndexToDirect()
                        }
                }
                return this.uv
            }, UV.prototype.parseUV_ByPolygonVertex_Direct = function (node, indices, strides, itemSize) {
                return parse_Data_ByPolygonVertex_Direct(node, indices, strides, itemSize)
            }, UV.prototype.parseUV_ByPolygonVertex_IndexToDirect = function (node, indices) {
                return parse_Data_ByPolygonVertex_IndexToDirect(node, indices, 2)
            }, UV.prototype.parseUV_ByPolygon_Direct = function (node) {
                return console.warn("not implemented"), node
            }, UV.prototype.parseUV_ByPolygon_IndexToDirect = function (node) {
                return console.warn("not implemented"), node
            }, UV.prototype.parseUV_ByVertex_Direct = function (node) {
                return console.warn("not implemented"), node
            }, Normal.prototype.getNormal = function (node) {
                return this.node && this.normal && this.map && this.ref ? this.normal : (this._parseText(node), this.normal)
            }, Normal.prototype.getMap = function (node) {
                return this.node && this.normal && this.map && this.ref ? this.map : (this._parseText(node), this.map)
            }, Normal.prototype.getRef = function (node) {
                return this.node && this.normal && this.map && this.ref ? this.ref : (this._parseText(node), this.ref)
            }, Normal.prototype.getNode = function (node) {
                return this.node ? this.node : (this.node = node.subNodes.LayerElementNormal, this.node)
            }, Normal.prototype._parseText = function (node) {
                var normalNode = this.getNode(node);
                if (void 0 === normalNode) return void console.warn("node: " + node.attrName + "(" + node.id + ") does not have LayerElementNormal");
                var mappingType = normalNode.properties.MappingInformationType,
                    refType = normalNode.properties.ReferenceInformationType,
                    rawTextNormals = normalNode.subNodes.Normals.properties.a;
                this.normal = toFloat(rawTextNormals.split(",")), this.map = mappingType, this.ref = refType
            }, Normal.prototype.parse = function (topnode, geo) {
                var normals = this.getNormal(topnode),
                    mappingType = (this.getNode(topnode), this.getMap(topnode)),
                    refType = this.getRef(topnode),
                    indices = geo.getPolygonVertexIndices(topnode),
                    strides = geo.getPolygonTopologyArray(topnode);
                switch (mappingType) {
                    case "ByPolygonVertex":
                        switch (refType) {
                            case "Direct":
                                normals = this.parseNormal_ByPolygonVertex_Direct(normals, indices, strides, 3);
                                break;
                            case "IndexToDirect":
                                normals = this.parseNormal_ByPolygonVertex_IndexToDirect()
                        }
                        break;
                    case "ByPolygon":
                        switch (refType) {
                            case "Direct":
                                normals = this.parseNormal_ByPolygon_Direct();
                                break;
                            case "IndexToDirect":
                                normals = this.parseNormal_ByPolygon_IndexToDirect()
                        }
                }
                return normals
            }, Normal.prototype.parseNormal_ByPolygonVertex_Direct = function (node, indices, strides, itemSize) {
                return parse_Data_ByPolygonVertex_Direct(node, indices, strides, itemSize)
            }, Normal.prototype.parseNormal_ByPolygonVertex_IndexToDirect = function (node) {
                return console.warn("not implemented"), node
            }, Normal.prototype.parseNormal_ByPolygon_Direct = function (node) {
                return console.warn("not implemented"), node
            }, Normal.prototype.parseNormal_ByPolygon_IndexToDirect = function (node) {
                return console.warn("not implemented"), node
            }, Normal.prototype.parseNormal_ByVertex_Direct = function (node) {
                return console.warn("not implemented"), node
            }, AnimationCurve.prototype.fromNode = function (curveNode) {
                return this.id = curveNode.id, this.internalId = curveNode.id, this.times = curveNode.subNodes.KeyTime.properties.a, this.values = curveNode.subNodes.KeyValueFloat.properties.a, this.attrFlag = curveNode.subNodes.KeyAttrFlags.properties.a, this.attrData = curveNode.subNodes.KeyAttrDataFloat.properties.a, this.times = toFloat(this.times.split(",")), this.values = toFloat(this.values.split(",")), this.attrData = toFloat(this.attrData.split(",")), this.attrFlag = toInt(this.attrFlag.split(",")), this.times = this.times.map(function (element) {
                    return FBXTimeToSeconds(element)
                }), this
            }, AnimationCurve.prototype.getLength = function () {
                return this.times[this.times.length - 1]
            }, AnimationNode.prototype.fromNode = function (allNodes, node, bones) {
                if (this.id = node.id, this.attr = node.attrName, this.internalId = node.id, !this.attr.match(/S|R|T/)) return null;
                for (var attrKey in node.properties) attrKey.match(/X/) && (this.attrX = !0), attrKey.match(/Y/) && (this.attrY = !0), attrKey.match(/Z/) && (this.attrZ = !0);
                this.containerIndices = allNodes.searchConnectionParent(this.id), this.curveIdx = allNodes.searchConnectionChildren(this.id);
                for (var i = this.containerIndices.length - 1; i >= 0; --i) {
                    var boneId = bones.searchRealId(this.containerIndices[i]);
                    if (boneId >= 0 && (this.containerBoneId = boneId, this.containerId = this.containerIndices[i]), boneId >= 0) break
                }
                return this
            }, AnimationNode.prototype.setCurve = function (curve) {
                this.curves.push(curve)
            }, Animation.prototype.parse = function (node, bones) {
                var rawNodes = node.Objects.subNodes.AnimationCurveNode,
                    rawCurves = node.Objects.subNodes.AnimationCurve,
                    curveNodes = [];
                for (var key in rawNodes)
                    if (key.match(/\d+/)) {
                        var a = (new AnimationNode).fromNode(node, rawNodes[key], bones);
                        curveNodes.push(a)
                    }
                for (var tmp = {}, i = 0; i < curveNodes.length; ++i) null !== curveNodes[i] && (tmp[curveNodes[i].id] = curveNodes[i]);
                var ac = [],
                    max = 0;
                for (key in rawCurves)
                    if (key.match(/\d+/)) {
                        var c = (new AnimationCurve).fromNode(rawCurves[key]);
                        ac.push(c), max = c.getLength() ? c.getLength() : max;
                        var parentId = node.searchConnectionParent(c.id)[0],
                            axis = node.searchConnectionType(c.id, parentId);
                        axis.match(/X/) && (axis = "x"), axis.match(/Y/) && (axis = "y"), axis.match(/Z/) && (axis = "z"), tmp[parentId].curves[axis] = c
                    }
                for (var t in tmp) {
                    var id = tmp[t].containerBoneId;
                    void 0 === this.curves[id] && (this.curves[id] = {}), this.curves[id][tmp[t].attr] = tmp[t]
                }
                return this.length = max, this.frames = this.length * this.fps, this
            }, Textures.prototype.add = function (tex) {
                void 0 === this.textures && (this.textures = []), this.textures.push(tex);
                for (var i = 0; i < tex.parentIds.length; ++i) void 0 === this.perGeoMap[tex.parentIds[i]] && (this.perGeoMap[tex.parentIds[i]] = []), this.perGeoMap[tex.parentIds[i]].push(this.textures[this.textures.length - 1])
            }, Textures.prototype.parse = function (node) {
                var rawNodes = node.Objects.subNodes.Texture;
                for (var n in rawNodes) {
                    var tex = (new Texture).parse(rawNodes[n], node);
                    this.add(tex)
                }
                return this
            }, Textures.prototype.getById = function (id) {
                return this.perGeoMap[id]
            }, Texture.prototype.parse = function (node, nodes) {
                return this.id = node.id, this.name = node.attrName, this.fileName = this.parseFileName(node.properties.FileName), this.parentIds = this.searchParents(this.id, nodes), this
            }, Texture.prototype.parseFileName = function (fname) {
                if (void 0 === fname) return "";
                var splitted = fname.split(/[\\\/]/);
                return splitted.length > 0 ? splitted[splitted.length - 1] : fname
            }, Texture.prototype.searchParents = function (id, nodes) {
                var p = nodes.searchConnectionParent(id);
                return p
            };
            var parse_Data_ByPolygonVertex_Direct = function (node, indices, strides, itemSize) {
                    for (var tmp = [], currentIndex = 0, i = 0; i < indices.length; ++i) {
                        tmp[indices[i]] = [];
                        for (var s = 0; itemSize > s; ++s) tmp[indices[i]][s] = node[currentIndex + s];
                        currentIndex += itemSize
                    }
                    for (var res = [], jj = 0; jj < tmp.length; ++jj)
                        if (void 0 !== tmp[jj])
                            for (var t = 0; itemSize > t; ++t) void 0 !== tmp[jj][t] && res.push(tmp[jj][t]);
                    return res
                },
                FBXTimeToSeconds = function (adskTime) {
                    return adskTime / 46186158e3
                },
                degToRad = function (degrees) {
                    return degrees * Math.PI / 180
                },
                quatFromVec = function (x, y, z) {
                    var euler = new THREE.Euler(x, y, z, "ZYX"),
                        quat = new THREE.Quaternion;
                    return quat.setFromEuler(euler), quat
                },
                toInt = function (arr) {
                    return arr.map(function (element) {
                        return parseInt(element)
                    })
                },
                toFloat = function (arr) {
                    return arr.map(function (element) {
                        return parseFloat(element)
                    })
                },
                toRad = function (arr) {
                    return arr.map(function (element) {
                        return degToRad(element)
                    })
                },
                toMat44 = function (arr) {
                    var mat = new THREE.Matrix4;
                    return mat.set(arr[0], arr[4], arr[8], arr[12], arr[1], arr[5], arr[9], arr[13], arr[2], arr[6], arr[10], arr[14], arr[3], arr[7], arr[11], arr[15]), mat
                }
        }, {}],
        13: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _ouioui = require("ouioui"),
                _ouioui2 = _interopRequireDefault(_ouioui),
                GUI = function GUI() {
                    _classCallCheck(this, GUI), this.panel = _ouioui2["default"].datoui()
                },
                gui = new GUI;
            exports["default"] = gui.panel
        }, {
            ouioui: 9
        }],
        14: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _threeOrbitControls = require("three-orbit-controls"),
                _threeOrbitControls2 = _interopRequireDefault(_threeOrbitControls);
            exports["default"] = _threeOrbitControls2["default"](THREE)
        }, {
            "three-orbit-controls": 10
        }],
        15: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _minSignal = require("min-signal"),
                _minSignal2 = _interopRequireDefault(_minSignal),
                Window = function (_MinSignal) {
                    function Window() {
                        _classCallCheck(this, Window);
                        var _this = _possibleConstructorReturn(this, (Window.__proto__ || Object.getPrototypeOf(Window)).call(this));
                        return _this.handleResize = _this.handleResize.bind(_this), window.addEventListener("resize", _this.handleResize), _this
                    }
                    return _inherits(Window, _MinSignal), _createClass(Window, [{
                        key: "handleResize",
                        value: function () {
                            this.dispatch(window.innerWidth, window.innerHeight)
                        }
                    }]), Window
                }(_minSignal2["default"]);
            exports["default"] = new Window
        }, {
            "min-signal": 8
        }],
        16: [function (require, module, exports) {
            "use strict";

            function _interopRequireWildcard(obj) {
                if (obj && obj.__esModule) return obj;
                var newObj = {};
                if (null != obj)
                    for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
                return newObj["default"] = obj, newObj
            }

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            }), exports.assetsLoader = exports.FBXLoader = exports.passes = exports.Pass = exports.PostProcessing = exports.Window = exports.OrbitControls = exports.GUI = exports.Clock = void 0;
            var _Clock2 = require("./Clock"),
                _Clock3 = _interopRequireDefault(_Clock2),
                _GUI2 = require("./GUI"),
                _GUI3 = _interopRequireDefault(_GUI2),
                _OrbitControls2 = require("./OrbitControls"),
                _OrbitControls3 = _interopRequireDefault(_OrbitControls2),
                _Window2 = require("./Window"),
                _Window3 = _interopRequireDefault(_Window2),
                _PostProcessing2 = require("./postProcessing/PostProcessing"),
                _PostProcessing3 = _interopRequireDefault(_PostProcessing2),
                _Pass2 = require("./postProcessing/passes/Pass"),
                _Pass3 = _interopRequireDefault(_Pass2),
                _passes2 = require("./postProcessing/passes"),
                _passes = _interopRequireWildcard(_passes2),
                _FBXLoader2 = require("./FBXLoader"),
                _FBXLoader3 = _interopRequireDefault(_FBXLoader2),
                _assetsLoader2 = require("assets-loader"),
                _assetsLoader3 = _interopRequireDefault(_assetsLoader2);
            exports.Clock = _Clock3["default"], exports.GUI = _GUI3["default"], exports.OrbitControls = _OrbitControls3["default"], exports.Window = _Window3["default"], exports.PostProcessing = _PostProcessing3["default"], exports.Pass = _Pass3["default"], exports.passes = _passes, exports.FBXLoader = _FBXLoader3["default"], exports.assetsLoader = _assetsLoader3["default"]
        }, {
            "./Clock": 11,
            "./FBXLoader": 12,
            "./GUI": 13,
            "./OrbitControls": 14,
            "./Window": 15,
            "./postProcessing/PostProcessing": 19,
            "./postProcessing/passes": 30,
            "./postProcessing/passes/Pass": 25,
            "assets-loader": 4
        }],
        17: [function (require, module, exports) {
            "use strict";

            function _interopRequireWildcard(obj) {
                if (obj && obj.__esModule) return obj;
                var newObj = {};
                if (null != obj)
                    for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
                return newObj["default"] = obj, newObj
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _helpers = require("../../helpers"),
                helpers = _interopRequireWildcard(_helpers),
                Composer = function () {
                    function Composer(renderer, renderTarget) {
                        if (_classCallCheck(this, Composer), this.renderer = renderer, void 0 === renderTarget) {
                            var parameters = {
                                    minFilter: THREE.LinearFilter,
                                    magFilter: THREE.LinearFilter,
                                    format: THREE.RGBAFormat,
                                    stencilBuffer: !1
                                },
                                size = this.renderer.getSize();
                            renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, parameters)
                        }
                        this.renderTarget1 = renderTarget, this.renderTarget2 = renderTarget.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.passes = [], this.copyPass = new helpers.passes.ShaderPass
                    }
                    return _createClass(Composer, [{
                        key: "swapBuffers",
                        value: function () {
                            var tmp = this.readBuffer;
                            this.readBuffer = this.writeBuffer, this.writeBuffer = tmp
                        }
                    }, {
                        key: "addPass",
                        value: function (pass) {
                            this.passes.push(pass);
                            var size = this.renderer.getSize(),
                                pixelRatio = this.renderer.getPixelRatio();
                            pass.setSize(size.width * pixelRatio, size.height * pixelRatio)
                        }
                    }, {
                        key: "insertPass",
                        value: function (pass, index) {
                            this.passes.splice(index, 0, pass)
                        }
                    }, {
                        key: "render",
                        value: function (delta, time) {
                            for (var maskActive = !1, passesLength = this.passes.length, i = 0; passesLength > i; i++) {
                                var pass = this.passes[i];
                                if (pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, time, maskActive), pass.needsSwap) {
                                    if (maskActive) {
                                        var context = this.renderer.context;
                                        context.stencilFunc(context.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, time), context.stencilFunc(context.EQUAL, 1, 4294967295)
                                    }
                                    this.swapBuffers()
                                }
                                void 0 !== helpers.passes.MaskPass && (pass instanceof helpers.passes.MaskPass ? maskActive = !0 : pass instanceof helpers.passes.ClearMaskPass && (maskActive = !1))
                            }
                        }
                    }, {
                        key: "reset",
                        value: function (renderTarget) {
                            if (void 0 === renderTarget) {
                                var size = this.renderer.getSize();
                                renderTarget = this.renderTarget1.clone(), renderTarget.setSize(size.width, size.height)
                            }
                            this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = renderTarget, this.renderTarget2 = renderTarget.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2
                        }
                    }, {
                        key: "setSize",
                        value: function (width, height) {
                            this.renderTarget1.setSize(width, height), this.renderTarget2.setSize(width, height);
                            for (var i = 0; i < this.passes.length; i++) this.passes[i].setSize(width, height)
                        }
                    }]), Composer
                }();
            exports["default"] = Composer
        }, {
            "../../helpers": 16
        }],
        18: [function (require, module, exports) {
            "use strict";

            function _interopRequireWildcard(obj) {
                if (obj && obj.__esModule) return obj;
                var newObj = {};
                if (null != obj)
                    for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
                return newObj["default"] = obj, newObj
            }

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _Composer2 = require("./Composer"),
                _Composer3 = _interopRequireDefault(_Composer2),
                _helpers = require("../../helpers"),
                helpers = _interopRequireWildcard(_helpers),
                EffectComposer = function (_Composer) {
                    function EffectComposer(renderer) {
                        _classCallCheck(this, EffectComposer);
                        var _this = _possibleConstructorReturn(this, (EffectComposer.__proto__ || Object.getPrototypeOf(EffectComposer)).call(this, renderer));
                        return _this.renderer = renderer, helpers.Window.add(_this.onResize.bind(_this)), _this
                    }
                    return _inherits(EffectComposer, _Composer), _createClass(EffectComposer, [{
                        key: "onResize",
                        value: function (width, height) {
                            this.setSize(width * this.renderer.getPixelRatio(), height * this.renderer.getPixelRatio())
                        }
                    }]), EffectComposer
                }(_Composer3["default"]);
            exports["default"] = EffectComposer
        }, {
            "../../helpers": 16,
            "./Composer": 17
        }],
        19: [function (require, module, exports) {
            "use strict";

            function _interopRequireWildcard(obj) {
                if (obj && obj.__esModule) return obj;
                var newObj = {};
                if (null != obj)
                    for (var key in obj) Object.prototype.hasOwnProperty.call(obj, key) && (newObj[key] = obj[key]);
                return newObj["default"] = obj, newObj
            }

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _EffectComposer = require("./EffectComposer"),
                _EffectComposer2 = _interopRequireDefault(_EffectComposer),
                _helpers = require("../../helpers"),
                helpers = _interopRequireWildcard(_helpers),
                PostProcessing = function () {
                    function PostProcessing(scene, camera, renderer, config) {
                        _classCallCheck(this, PostProcessing), this.scene = scene, this.camera = camera, this.renderer = renderer, this.configuration = config, this.passes = this.configuration.passes.filter(function (pass) {
                            return pass.active
                        }), this.active = this.configuration.active, this.composer = new _EffectComposer2["default"](this.renderer), this.composer.addPass(new helpers.passes.RenderPass(this.scene, this.camera));
                        for (var i = 0; i < this.passes.length; i++) this.composer.addPass(this.passes[i].constructor), i == this.passes.length - 1 && (this.passes[i].constructor.renderToScreen = !0);
                        this.addGUI()
                    }
                    return _createClass(PostProcessing, [{
                        key: "addGUI",
                        value: function () {
                            this.GUI = helpers.GUI, this.GUI.add(this, "active", {
                                label: "Post processing"
                            })
                        }
                    }, {
                        key: "update",
                        value: function () {
                            this.active && this.passes.length ? this.composer.render(this.scene.clock.delta, this.scene.clock.time) : this.renderer.render(this.scene, this.camera)
                        }
                    }]), PostProcessing
                }();
            exports["default"] = PostProcessing
        }, {
            "../../helpers": 16,
            "./EffectComposer": 18
        }],
        20: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _Pass2 = require("../Pass"),
                _Pass3 = _interopRequireDefault(_Pass2),
                _basic = require("../../shaders/basic.vert"),
                _basic2 = _interopRequireDefault(_basic),
                _copy = require("../../shaders/copy.frag"),
                _copy2 = _interopRequireDefault(_copy),
                _luminosityHigh = require("../../shaders/luminosity-high.frag"),
                _luminosityHigh2 = _interopRequireDefault(_luminosityHigh),
                _blur = require("./blur.frag"),
                _blur2 = _interopRequireDefault(_blur),
                _composite = require("./composite.frag"),
                _composite2 = _interopRequireDefault(_composite),
                blurDirection = {
                    x: new THREE.Vector2(1, 0),
                    y: new THREE.Vector2(0, 1)
                },
                UnrealBloomPass = function (_Pass) {
                    function UnrealBloomPass(_ref) {
                        var _ref$resolution = _ref.resolution,
                            resolution = void 0 === _ref$resolution ? new THREE.Vector2(256, 256) : _ref$resolution,
                            _ref$strength = _ref.strength,
                            strength = void 0 === _ref$strength ? 1 : _ref$strength,
                            _ref$radius = _ref.radius,
                            radius = void 0 === _ref$radius ? 1 : _ref$radius,
                            _ref$threshold = _ref.threshold,
                            threshold = void 0 === _ref$threshold ? .8 : _ref$threshold;
                        _classCallCheck(this, UnrealBloomPass);
                        var _this = _possibleConstructorReturn(this, (UnrealBloomPass.__proto__ || Object.getPrototypeOf(UnrealBloomPass)).call(this));
                        _this.resolution = resolution, _this.strength = strength, _this.radius = radius, _this.threshold = threshold;
                        var options = {
                            minFilter: THREE.LinearFilter,
                            magFilter: THREE.LinearFilter,
                            format: THREE.RGBAFormat
                        };
                        _this.renderTargetsHorizontal = [], _this.renderTargetsVertical = [], _this.nMips = 5;
                        var resx = Math.round(_this.resolution.x / 2),
                            resy = Math.round(_this.resolution.y / 2);
                        _this.renderTargetBright = new THREE.WebGLRenderTarget(resx, resy, options), _this.renderTargetBright.texture.generateMipmaps = !1;
                        for (var i = 0; i < _this.nMips; i++) {
                            var renderTarget = new THREE.WebGLRenderTarget(resx, resy, options);
                            renderTarget.texture.generateMipmaps = !1, _this.renderTargetsHorizontal.push(renderTarget), renderTarget = new THREE.WebGLRenderTarget(resx, resy, options), renderTarget.texture.generateMipmaps = !1, _this.renderTargetsVertical.push(renderTarget), resx = Math.round(resx / 2), resy = Math.round(resy / 2)
                        }
                        _this.materialHighPassFilter = new THREE.ShaderMaterial({
                            uniforms: {
                                tInput: {
                                    value: null
                                },
                                luminosityThreshold: {
                                    value: 1
                                },
                                smoothWidth: {
                                    value: 1
                                },
                                defaultColor: {
                                    value: new THREE.Color(0)
                                },
                                defaultOpacity: {
                                    value: 0
                                }
                            },
                            vertexShader: _basic2["default"],
                            fragmentShader: _luminosityHigh2["default"]
                        }), _this.materialHighPassFilter.uniforms.luminosityThreshold.value = threshold, _this.materialHighPassFilter.uniforms.smoothWidth.value = .01, _this.separableBlurMaterials = [];
                        for (var kernelSizeArray = [3, 5, 7, 9, 11], _i = 0; _i < _this.nMips; _i++) {
                            var kernelRadius = kernelSizeArray[_i],
                                seperableBlurMaterial = new THREE.ShaderMaterial({
                                    defines: {
                                        KERNEL_RADIUS: kernelRadius,
                                        SIGMA: kernelRadius
                                    },
                                    uniforms: {
                                        colorTexture: {
                                            value: null
                                        },
                                        texSize: {
                                            value: new THREE.Vector2(.5, .5)
                                        },
                                        direction: {
                                            value: new THREE.Vector2(.5, .5)
                                        }
                                    },
                                    vertexShader: _basic2["default"],
                                    fragmentShader: _blur2["default"]
                                });
                            _this.separableBlurMaterials.push(seperableBlurMaterial), _this.separableBlurMaterials[_i].uniforms.texSize.value = new THREE.Vector2(resx, resy), resx = Math.round(resx / 2), resy = Math.round(resy / 2)
                        }
                        _this.compositeMaterial = new THREE.ShaderMaterial({
                            defines: {
                                NUM_MIPS: _this.nMips
                            },
                            uniforms: {
                                blurTexture1: {
                                    value: null
                                },
                                blurTexture2: {
                                    value: null
                                },
                                blurTexture3: {
                                    value: null
                                },
                                blurTexture4: {
                                    value: null
                                },
                                blurTexture5: {
                                    value: null
                                },
                                dirtTexture: {
                                    value: null
                                },
                                bloomStrength: {
                                    value: 1
                                },
                                bloomFactors: {
                                    value: null
                                },
                                bloomTintColors: {
                                    value: null
                                },
                                bloomRadius: {
                                    value: 0
                                }
                            },
                            vertexShader: _basic2["default"],
                            fragmentShader: _composite2["default"]
                        }), _this.compositeMaterial.uniforms.blurTexture1.value = _this.renderTargetsVertical[0].texture, _this.compositeMaterial.uniforms.blurTexture2.value = _this.renderTargetsVertical[1].texture, _this.compositeMaterial.uniforms.blurTexture3.value = _this.renderTargetsVertical[2].texture, _this.compositeMaterial.uniforms.blurTexture4.value = _this.renderTargetsVertical[3].texture, _this.compositeMaterial.uniforms.blurTexture5.value = _this.renderTargetsVertical[4].texture, _this.compositeMaterial.uniforms.bloomStrength.value = strength, _this.compositeMaterial.uniforms.bloomRadius.value = .1, _this.compositeMaterial.needsUpdate = !0;
                        var bloomFactors = [1, .8, .6, .4, .2];
                        return _this.compositeMaterial.uniforms.bloomFactors.value = bloomFactors, _this.bloomTintColors = [new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, 1)], _this.compositeMaterial.uniforms.bloomTintColors.value = _this.bloomTintColors, _this.materialCopy = new THREE.ShaderMaterial({
                            uniforms: {
                                tInput: {
                                    value: null
                                },
                                uOpacity: {
                                    value: 1
                                }
                            },
                            vertexShader: _basic2["default"],
                            fragmentShader: _copy2["default"],
                            blending: THREE.AdditiveBlending,
                            depthTest: !1,
                            depthWrite: !1,
                            transparent: !0
                        }), _this.enabled = !0, _this.needsSwap = !1, _this.oldClearColor = new THREE.Color, _this.oldClearAlpha = 1, _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), _this.scene = new THREE.Scene, _this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), _this.scene.add(_this.quad), _this
                    }
                    return _inherits(UnrealBloomPass, _Pass), _createClass(UnrealBloomPass, [{
                        key: "dispose",
                        value: function () {
                            for (var i = 0; i < this.renderTargetsHorizontal.length(); i++) this.renderTargetsHorizontal[i].dispose();
                            for (var _i2 = 0; _i2 < this.renderTargetsVertical.length(); _i2++) this.renderTargetsVertical[_i2].dispose();
                            this.renderTargetBright.dispose()
                        }
                    }, {
                        key: "setSize",
                        value: function (width, height) {
                            var resx = Math.round(width / 2),
                                resy = Math.round(height / 2);
                            this.renderTargetBright.setSize(resx, resy);
                            for (var i = 0; i < this.nMips; i++) this.renderTargetsHorizontal[i].setSize(resx, resy), this.renderTargetsVertical[i].setSize(resx, resy), this.separableBlurMaterials[i].uniforms.texSize.value = new THREE.Vector2(resx, resy), resx = Math.round(resx / 2), resy = Math.round(resy / 2)
                        }
                    }, {
                        key: "render",
                        value: function (renderer, writeBuffer, readBuffer, delta, time, maskActive) {
                            this.oldClearColor.copy(renderer.getClearColor()), this.oldClearAlpha = renderer.getClearAlpha();
                            var oldAutoClear = renderer.autoClear;
                            renderer.autoClear = !1, renderer.setClearColor(new THREE.Color(0, 0, 0), 0), maskActive && renderer.context.disable(renderer.context.STENCIL_TEST), this.materialHighPassFilter.uniforms.tInput.value = readBuffer.texture, this.materialHighPassFilter.uniforms.luminosityThreshold.value = this.threshold, this.quad.material = this.materialHighPassFilter, renderer.render(this.scene, this.camera, this.renderTargetBright, !0);
                            for (var inputRenderTarget = this.renderTargetBright, i = 0; i < this.nMips; i++) this.quad.material = this.separableBlurMaterials[i], this.separableBlurMaterials[i].uniforms.colorTexture.value = inputRenderTarget.texture, this.separableBlurMaterials[i].uniforms.direction.value = blurDirection.x, renderer.render(this.scene, this.camera, this.renderTargetsHorizontal[i], !0), this.separableBlurMaterials[i].uniforms.colorTexture.value = this.renderTargetsHorizontal[i].texture, this.separableBlurMaterials[i].uniforms.direction.value = blurDirection.y, renderer.render(this.scene, this.camera, this.renderTargetsVertical[i], !0), inputRenderTarget = this.renderTargetsVertical[i];
                            this.quad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, renderer.render(this.scene, this.camera, this.renderTargetsHorizontal[0], !0), this.quad.material = this.materialCopy, this.materialCopy.uniforms.tInput.value = this.renderTargetsHorizontal[0].texture, maskActive && renderer.context.enable(renderer.context.STENCIL_TEST), renderer.render(this.scene, this.camera, readBuffer, this.clear), renderer.setClearColor(this.oldClearColor, this.oldClearAlpha), renderer.autoClear = oldAutoClear
                        }
                    }]), UnrealBloomPass
                }(_Pass3["default"]);
            exports["default"] = UnrealBloomPass
        }, {
            "../../shaders/basic.vert": 31,
            "../../shaders/copy.frag": 32,
            "../../shaders/luminosity-high.frag": 33,
            "../Pass": 25,
            "./blur.frag": 21,
            "./composite.frag": 22
        }],
        21: [function (require, module) {
            module.exports = "#define GLSLIFY 1\n#include <common>\n\nuniform sampler2D colorTexture;\nuniform vec2 texSize;\nuniform vec2 direction;\n\nvarying vec2 vUv;\n\nfloat gaussianPdf(in float x, in float sigma) {\n  return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;\n}\n\nvoid main() {\n  vec2 invSize = 1.0 / texSize;\n  float fSigma = float(SIGMA);\n  float weightSum = gaussianPdf(0.0, fSigma);\n  vec3 diffuseSum = texture2D(colorTexture, vUv).rgb * weightSum;\n  \n  for (int i = 1; i < KERNEL_RADIUS; i ++) {\n    float x = float(i);\n    float w = gaussianPdf(x, fSigma);\n    vec2 uvOffset = direction * invSize * x;\n    vec3 sample1 = texture2D(colorTexture, vUv + uvOffset).rgb;\n    vec3 sample2 = texture2D(colorTexture, vUv - uvOffset).rgb;\n    diffuseSum += (sample1 + sample2) * w;\n    weightSum += 2.0 * w;\n  }\n\n  gl_FragColor = vec4(diffuseSum / weightSum, 1.0);\n}\n"
        }, {}],
        22: [function (require, module) {
            module.exports = "#define GLSLIFY 1\nuniform sampler2D blurTexture1;\nuniform sampler2D blurTexture2;\nuniform sampler2D blurTexture3;\nuniform sampler2D blurTexture4;\nuniform sampler2D blurTexture5;\nuniform sampler2D dirtTexture;\n\nuniform float bloomStrength;\nuniform float bloomRadius;\n\nuniform float bloomFactors[NUM_MIPS];\nuniform vec3 bloomTintColors[NUM_MIPS];\n\nvarying vec2 vUv;\n\nfloat lerpBloomFactor(const in float factor) { \n  float mirrorFactor = 1.2 - factor;\n  return mix(factor, mirrorFactor, bloomRadius);\n}\n\nvoid main() {\n  gl_FragColor = bloomStrength * (lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + \n                  lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + \n                  lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + \n                  lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + \n                  lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv));\n}\n"
        }, {}],
        23: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _Pass2 = require("../Pass"),
                _Pass3 = _interopRequireDefault(_Pass2),
                ClearMaskPass = function (_Pass) {
                    function ClearMaskPass() {
                        _classCallCheck(this, ClearMaskPass);
                        var _this = _possibleConstructorReturn(this, (ClearMaskPass.__proto__ || Object.getPrototypeOf(ClearMaskPass)).call(this));
                        return _this.needsSwap = !1, _this
                    }
                    return _inherits(ClearMaskPass, _Pass), _createClass(ClearMaskPass, [{
                        key: "render",
                        value: function (renderer) {
                            renderer.state.buffers.stencil.setTest(!1)
                        }
                    }]), ClearMaskPass
                }(_Pass3["default"]);
            exports["default"] = ClearMaskPass
        }, {
            "../Pass": 25
        }],
        24: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _Pass2 = require("../Pass"),
                _Pass3 = _interopRequireDefault(_Pass2),
                MaskPass = function (_Pass) {
                    function MaskPass(scene, camera) {
                        _classCallCheck(this, MaskPass);
                        var _this = _possibleConstructorReturn(this, (MaskPass.__proto__ || Object.getPrototypeOf(MaskPass)).call(this));
                        return _this.scene = scene, _this.camera = camera, _this.clear = !0, _this.needsSwap = !1, _this.inverse = !1, _this
                    }
                    return _inherits(MaskPass, _Pass), _createClass(MaskPass, [{
                        key: "render",
                        value: function (renderer, writeBuffer, readBuffer) {
                            var context = renderer.context,
                                state = renderer.state;
                            state.buffers.color.setMask(!1), state.buffers.depth.setMask(!1), state.buffers.color.setLocked(!0), state.buffers.depth.setLocked(!0);
                            var writeValue, clearValue;
                            this.inverse ? (writeValue = 0, clearValue = 1) : (writeValue = 1, clearValue = 0), state.buffers.stencil.setTest(!0), state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE), state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 4294967295), state.buffers.stencil.setClear(clearValue), renderer.render(this.scene, this.camera, readBuffer, this.clear), renderer.render(this.scene, this.camera, writeBuffer, this.clear), state.buffers.color.setLocked(!1), state.buffers.depth.setLocked(!1), state.buffers.stencil.setFunc(context.EQUAL, 1, 4294967295), state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP)
                        }
                    }]), MaskPass
                }(_Pass3["default"]);
            exports["default"] = MaskPass
        }, {
            "../Pass": 25
        }],
        25: [function (require, module, exports) {
            "use strict";

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                Pass = function () {
                    function Pass() {
                        _classCallCheck(this, Pass), this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1
                    }
                    return _createClass(Pass, [{
                        key: "setSize",
                        value: function () {}
                    }, {
                        key: "render",
                        value: function () {
                            console.error("THREE.Pass: .render() must be implemented in derived pass.")
                        }
                    }]), Pass
                }();
            exports["default"] = Pass
        }, {}],
        26: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _extends = Object.assign || function (target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i];
                        for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key])
                    }
                    return target
                },
                _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _get = function get(object, property, receiver) {
                    null === object && (object = Function.prototype);
                    var desc = Object.getOwnPropertyDescriptor(object, property);
                    if (void 0 === desc) {
                        var parent = Object.getPrototypeOf(object);
                        return null === parent ? void 0 : get(parent, property, receiver)
                    }
                    if ("value" in desc) return desc.value;
                    var getter = desc.get;
                    return void 0 === getter ? void 0 : getter.call(receiver)
                },
                _ShaderPass2 = require("../ShaderPass/ShaderPass"),
                _ShaderPass3 = _interopRequireDefault(_ShaderPass2),
                _post = require("./post.frag"),
                _post2 = _interopRequireDefault(_post),
                PostPass = function (_ShaderPass) {
                    function PostPass() {
                        _classCallCheck(this, PostPass);
                        var _this = _possibleConstructorReturn(this, (PostPass.__proto__ || Object.getPrototypeOf(PostPass)).call(this));
                        return _this.material.uniforms = _extends({}, _this.material.uniforms, {
                            uResolution: {
                                value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                            },
                            uTime: {
                                value: 0
                            }
                        }), _this.needsSwap = !1, _this.material.fragmentShader = _post2["default"], _this
                    }
                    return _inherits(PostPass, _ShaderPass), _createClass(PostPass, [{
                        key: "setSize",
                        value: function (width, height) {
                            this.material.uniforms.uResolution.value = new THREE.Vector2(width, height)
                        }
                    }, {
                        key: "render",
                        value: function (renderer, writeBuffer, readBuffer, delta, time, maskActive) {
                            _get(PostPass.prototype.__proto__ || Object.getPrototypeOf(PostPass.prototype), "render", this).call(this, renderer, writeBuffer, readBuffer, delta, time, maskActive), this.material.uniforms.uTime.value = time
                        }
                    }]), PostPass
                }(_ShaderPass3["default"]);
            exports["default"] = PostPass
        }, {
            "../ShaderPass/ShaderPass": 29,
            "./post.frag": 27
        }],
        27: [function (require, module) {
            module.exports = "#define GLSLIFY 1\n#define FXAA_REDUCE_MIN (1.0 / 128.0)\n#define FXAA_REDUCE_MUL (1.0 / 8.0)\n#define FXAA_SPAN_MAX    8.0\n\nvec4 fxaa(sampler2D tInput, vec2 uv, vec2 resolution) {\n  vec2 res = 1. / resolution;\n\n  vec3 rgbNW = texture2D( tInput, ( uv.xy + vec2( -1.0, -1.0 ) * res ) ).xyz;\n  vec3 rgbNE = texture2D( tInput, ( uv.xy + vec2( 1.0, -1.0 ) * res ) ).xyz;\n  vec3 rgbSW = texture2D( tInput, ( uv.xy + vec2( -1.0, 1.0 ) * res ) ).xyz;\n  vec3 rgbSE = texture2D( tInput, ( uv.xy + vec2( 1.0, 1.0 ) * res ) ).xyz;\n  vec4 rgbaM  = texture2D( tInput,  uv.xy  * res );\n  vec3 rgbM  = rgbaM.xyz;\n  vec3 luma = vec3( 0.299, 0.587, 0.114 );\n\n  float lumaNW = dot( rgbNW, luma );\n  float lumaNE = dot( rgbNE, luma );\n  float lumaSW = dot( rgbSW, luma );\n  float lumaSE = dot( rgbSE, luma );\n  float lumaM  = dot( rgbM,  luma );\n  float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );\n  float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );\n\n  vec2 dir;\n  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n  dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n  float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );\n\n  float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );\n  dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),\n        max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n              dir * rcpDirMin)) * res;\n  vec4 rgbA = (1.0 / 2.0) * (\n  texture2D(tInput, uv.xy + dir * (1.0 / 3.0 - 0.5)) +\n  texture2D(tInput, uv.xy + dir * (2.0 / 3.0 - 0.5)));\n  vec4 rgbB = rgbA * (1.0 / 2.0) + (1.0 / 4.0) * (\n  texture2D(tInput, uv.xy + dir * (0.0 / 3.0 - 0.5)) +\n  texture2D(tInput, uv.xy + dir * (3.0 / 3.0 - 0.5)));\n  float lumaB = dot(rgbB, vec4(luma, 0.0));\n\n  if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {\n    return rgbA;\n  } else {\n    return rgbB;\n  }\n}\n\nvec4 bsc(vec4 color, float brightness, float saturation, float contrast) {\n   vec3 bColor = color.rgb * brightness;\n   float intensity = dot(bColor, vec3(0.2125, 0.7154, 0.0721));\n   return vec4(mix(vec3(0.5), mix(vec3(intensity), bColor, saturation), contrast), color.a);\n}\n\nfloat random(vec2 n, float offset ){\n  return 0.5 - fract(sin(dot(n.xy + vec2( offset, 0. ), vec2(12.9898, 78.233)))* 43758.5453);\n}\n\nvec4 noise(vec4 color, vec2 pos, float time, float amount, float speed) {\n  return color + vec4(vec3(amount * random(pos, 0.00001 * speed * time)), 1.0);\n}\n\nvec4 vignette_0(vec4 color, float boost, float reduction, vec2 resolution) {\n  vec2 center = resolution * 0.5;\n  float vignette = distance(center, gl_FragCoord.xy)  / resolution.x;\n  vignette = boost - vignette * reduction;\n  return vec4(color.rgb * vignette, 1.0);\n}\n\nuniform sampler2D tInput;\nuniform float uTime;\nuniform vec2 uResolution;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vec4 color = texture2D(tInput, vUv);\n\n  color = fxaa(tInput, vUv, uResolution);\n  color = bsc(color, 1.0, 1.0, 1.2);\n  color = noise(color, vUv, uTime, 0.07, 0.2);\n  color = vignette_0(color, 1.3, 2.2, uResolution);\n\n  gl_FragColor = color;\n}\n"
        }, {}],
        28: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _Pass2 = require("../Pass"),
                _Pass3 = _interopRequireDefault(_Pass2),
                RenderPass = function (_Pass) {
                    function RenderPass(scene, camera, overrideMaterial, clearColor) {
                        var clearAlpha = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : 0;
                        _classCallCheck(this, RenderPass);
                        var _this = _possibleConstructorReturn(this, (RenderPass.__proto__ || Object.getPrototypeOf(RenderPass)).call(this));
                        return _this.scene = scene, _this.camera = camera, _this.overrideMaterial = overrideMaterial, _this.clearColor = clearColor, _this.clearAlpha = clearAlpha, _this.clear = !0, _this.needsSwap = !1, _this
                    }
                    return _inherits(RenderPass, _Pass), _createClass(RenderPass, [{
                        key: "render",
                        value: function (renderer, writeBuffer, readBuffer) {
                            var oldAutoClear = renderer.autoClear;
                            renderer.autoClear = !1, this.scene.overrideMaterial = this.overrideMaterial;
                            var oldClearColor = void 0,
                                oldClearAlpha = void 0;
                            this.clearColor && (oldClearColor = renderer.getClearColor().getHex(), oldClearAlpha = renderer.getClearAlpha(), renderer.setClearColor(this.clearColor, this.clearAlpha)), renderer.render(this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear), this.clearColor && renderer.setClearColor(oldClearColor, oldClearAlpha), this.scene.overrideMaterial = null, renderer.autoClear = oldAutoClear
                        }
                    }]), RenderPass
                }(_Pass3["default"]);
            exports["default"] = RenderPass
        }, {
            "../Pass": 25
        }],
        29: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
            }

            function _possibleConstructorReturn(self, call) {
                if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return !call || "object" != typeof call && "function" != typeof call ? self : call
            }

            function _inherits(subClass, superClass) {
                if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                subClass.prototype = Object.create(superClass && superClass.prototype, {
                    constructor: {
                        value: subClass,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass)
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            });
            var _createClass = function () {
                    function defineProperties(target, props) {
                        for (var i = 0; i < props.length; i++) {
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
                        }
                    }
                    return function (Constructor, protoProps, staticProps) {
                        return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
                    }
                }(),
                _Pass2 = require("../Pass"),
                _Pass3 = _interopRequireDefault(_Pass2),
                _basic = require("../../shaders/basic.vert"),
                _basic2 = _interopRequireDefault(_basic),
                _copy = require("../../shaders/copy.frag"),
                _copy2 = _interopRequireDefault(_copy),
                ShaderPass = function (_Pass) {
                    function ShaderPass() {
                        _classCallCheck(this, ShaderPass);
                        var _this = _possibleConstructorReturn(this, (ShaderPass.__proto__ || Object.getPrototypeOf(ShaderPass)).call(this));
                        return _this.material = new THREE.ShaderMaterial({
                            uniforms: {
                                tInput: {
                                    value: null
                                },
                                uOpacity: {
                                    value: 1
                                }
                            },
                            vertexShader: _basic2["default"],
                            fragmentShader: _copy2["default"]
                        }), _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), _this.scene = new THREE.Scene, _this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), _this.material), _this.scene.add(_this.quad), _this
                    }
                    return _inherits(ShaderPass, _Pass), _createClass(ShaderPass, [{
                        key: "render",
                        value: function (renderer, writeBuffer, readBuffer) {
                            this.material.uniforms.tInput.value = readBuffer.texture, this.renderToScreen ? renderer.render(this.scene, this.camera) : renderer.render(this.scene, this.camera, writeBuffer, this.clear)
                        }
                    }]), ShaderPass
                }(_Pass3["default"]);
            exports["default"] = ShaderPass
        }, {
            "../../shaders/basic.vert": 31,
            "../../shaders/copy.frag": 32,
            "../Pass": 25
        }],
        30: [function (require, module, exports) {
            "use strict";

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                }
            }
            Object.defineProperty(exports, "__esModule", {
                value: !0
            }), exports.ClearMaskPass = exports.ShaderPass = exports.MaskPass = exports.BloomUnrealPass = exports.PostPass = exports.RenderPass = void 0;
            var _RenderPass2 = require("./RenderPass/RenderPass"),
                _RenderPass3 = _interopRequireDefault(_RenderPass2),
                _PostPass2 = require("./PostPass/PostPass"),
                _PostPass3 = _interopRequireDefault(_PostPass2),
                _BloomUnrealPass2 = require("./BloomUnrealPass/BloomUnrealPass"),
                _BloomUnrealPass3 = _interopRequireDefault(_BloomUnrealPass2),
                _MaskPass2 = require("./MaskPass/MaskPass"),
                _MaskPass3 = _interopRequireDefault(_MaskPass2),
                _ShaderPass2 = require("./ShaderPass/ShaderPass"),
                _ShaderPass3 = _interopRequireDefault(_ShaderPass2),
                _ClearMaskPass2 = require("./ClearMaskPass/ClearMaskPass"),
                _ClearMaskPass3 = _interopRequireDefault(_ClearMaskPass2);
            exports.RenderPass = _RenderPass3["default"], exports.PostPass = _PostPass3["default"], exports.BloomUnrealPass = _BloomUnrealPass3["default"], exports.MaskPass = _MaskPass3["default"], exports.ShaderPass = _ShaderPass3["default"], exports.ClearMaskPass = _ClearMaskPass3["default"]
        }, {
            "./BloomUnrealPass/BloomUnrealPass": 20,
            "./ClearMaskPass/ClearMaskPass": 23,
            "./MaskPass/MaskPass": 24,
            "./PostPass/PostPass": 26,
            "./RenderPass/RenderPass": 28,
            "./ShaderPass/ShaderPass": 29
        }],
        31: [function (require, module) {
            module.exports = "#define GLSLIFY 1\nvarying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n"
        }, {}],
        32: [function (require, module) {
            module.exports = "#define GLSLIFY 1\nuniform sampler2D tInput;\nuniform float uOpacity;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vec4 color = texture2D(tInput, vUv);\n  gl_FragColor = color * uOpacity;\n}\n"
        }, {}],
        33: [function (require, module) {
            module.exports = "#define GLSLIFY 1\nuniform sampler2D tInput;\nuniform vec3 defaultColor;\nuniform float defaultOpacity;\nuniform float luminosityThreshold;\nuniform float smoothWidth;\n\nvarying vec2 vUv;\n\nvoid main() {\n\n  vec4 texel = texture2D(tInput, vUv);\n  vec3 luma = vec3(0.299, 0.587, 0.114 );\n  float v = dot(texel.xyz, luma);\n\n  vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);\n  float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, v);\n\n  gl_FragColor = mix(outputColor, texel, alpha);\n}\n"
        }, {}]
    }, {}, [16])(16)
});
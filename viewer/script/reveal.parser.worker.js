(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})((typeof self !== 'undefined' ? self : this), function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	(typeof self !== 'undefined' ? self : this)["webpackChunk"] = function webpackChunkCallback(chunkIds, moreModules) {
/******/ 		for(var moduleId in moreModules) {
/******/ 			modules[moduleId] = moreModules[moduleId];
/******/ 		}
/******/ 		while(chunkIds.length)
/******/ 			installedChunks[chunkIds.pop()] = 1;
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded chunks
/******/ 	// "1" means "already loaded"
/******/ 	var installedChunks = {
/******/ 		"reveal.parser.worker": 1
/******/ 	};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	function promiseResolve() { return Promise.resolve(); }
/******/
/******/ 	var wasmImportObjects = {
/******/ 		"./pkg/index_bg.wasm": function() {
/******/ 			return {
/******/ 				"./index_bg.js": {
/******/ 					"__wbg_parsererror_new": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["N"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_object_drop_ref": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["U"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_string_new": function(p0i32,p1i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["W"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_object_clone_ref": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["T"](p0i32);
/******/ 					},
/******/ 					"__wbg_new_59cb74e423758ede": function() {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["E"]();
/******/ 					},
/******/ 					"__wbg_stack_558ba5917b466edd": function(p0i32,p1i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["Q"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_error_4bb6c2a97407129a": function(p0i32,p1i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["A"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_attribute_new": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["y"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_number_new": function(p0f64) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["S"](p0f64);
/******/ 					},
/******/ 					"__wbg_new_6b6f346b4912cdae": function() {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["F"]();
/******/ 					},
/******/ 					"__wbg_push_f353108e20ec67a0": function(p0i32,p1i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["O"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_new_d333a6e567133fdb": function(p0i32,p1i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["H"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_new_4d63b46bdff6e16c": function() {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["D"]();
/******/ 					},
/******/ 					"__wbg_set_dfa2f1a42cb24532": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["P"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_buffer_44855aefa83ea48c": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["z"](p0i32);
/******/ 					},
/******/ 					"__wbg_newwithbyteoffsetandlength_0da86dad4d55fbae": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["J"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_new_04793d2c09ba060f": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["B"](p0i32);
/******/ 					},
/******/ 					"__wbg_newwithbyteoffsetandlength_b86dda8c37255ca3": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["L"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_new_a0b63d55f22daf72": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["G"](p0i32);
/******/ 					},
/******/ 					"__wbg_newwithbyteoffsetandlength_c9f84d09508543c6": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["M"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_new_05020d898fee9291": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["C"](p0i32);
/******/ 					},
/******/ 					"__wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["K"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_new_ed94ebb0ae0424e3": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["I"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_throw": function(p0i32,p1i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["X"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_rethrow": function(p0i32) {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["V"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_memory": function() {
/******/ 						return installedModules["./pkg/index_bg.js"].exports["R"]();
/******/ 					}
/******/ 				}
/******/ 			};
/******/ 		},
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/ 		promises.push(Promise.resolve().then(function() {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				importScripts(__webpack_require__.p + "" + ({}[chunkId]||chunkId) + ".js");
/******/ 			}
/******/ 		}));
/******/
/******/ 		// Fetch + compile chunk loading for webassembly
/******/
/******/ 		var wasmModules = {"0":["./pkg/index_bg.wasm"]}[chunkId] || [];
/******/
/******/ 		wasmModules.forEach(function(wasmModuleId) {
/******/ 			var installedWasmModuleData = installedWasmModules[wasmModuleId];
/******/
/******/ 			// a Promise means "currently loading" or "already loaded".
/******/ 			if(installedWasmModuleData)
/******/ 				promises.push(installedWasmModuleData);
/******/ 			else {
/******/ 				var importObject = wasmImportObjects[wasmModuleId]();
/******/ 				var req = fetch(__webpack_require__.p + "" + {"./pkg/index_bg.wasm":"56e60cac7d156ecdc568"}[wasmModuleId] + ".module.wasm");
/******/ 				var promise;
/******/ 				if(importObject instanceof Promise && typeof WebAssembly.compileStreaming === 'function') {
/******/ 					promise = Promise.all([WebAssembly.compileStreaming(req), importObject]).then(function(items) {
/******/ 						return WebAssembly.instantiate(items[0], items[1]);
/******/ 					});
/******/ 				} else if(typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 					promise = WebAssembly.instantiateStreaming(req, importObject);
/******/ 				} else {
/******/ 					var bytesPromise = req.then(function(x) { return x.arrayBuffer(); });
/******/ 					promise = bytesPromise.then(function(bytes) {
/******/ 						return WebAssembly.instantiate(bytes, importObject);
/******/ 					});
/******/ 				}
/******/ 				promises.push(installedWasmModules[wasmModuleId] = promise.then(function(res) {
/******/ 					return __webpack_require__.w[wasmModuleId] = (res.instance || res).exports;
/******/ 				}));
/******/ 			}
/******/ 		});
/******/ 		return Promise.all(promises);
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "https://unpkg.com/mn-reveal-worker-test@0.0.6/";
/******/
/******/ 	// object with all WebAssembly.instance exports
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/utilities/workers/reveal.parser.worker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/utilities/workers/reveal.parser.worker.ts":
/*!*******************************************************!*\
  !*** ./src/utilities/workers/reveal.parser.worker.ts ***!
  \*******************************************************/
/*! exports provided: RevealParserWorker */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RevealParserWorker", function() { return RevealParserWorker; });
/* harmony import */ var comlink__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! comlink */ "comlink");
/* harmony import */ var comlink__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(comlink__WEBPACK_IMPORTED_MODULE_0__);
/*!
 * Copyright 2020 Cognite AS
 */

const rustModule = __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ../../../pkg */ "./pkg/index.js"));
class RevealParserWorker {
    async parseSector(buffer) {
        const rust = await rustModule;
        const sectorData = rust.parse_and_convert_sector(buffer);
        const instanceMeshes = this.extractInstanceMeshes(sectorData);
        const triangleMeshes = this.extractTriangleMeshes(sectorData);
        const parsedPrimitives = this.extractParsedPrimitives(sectorData);
        const parseResult = {
            treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
            nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map(),
            primitives: parsedPrimitives,
            instanceMeshes,
            triangleMeshes
        };
        sectorData.free();
        return parseResult;
    }
    async parseCtm(buffer) {
        const rust = await rustModule;
        // TODO handle parsing failure
        const ctm = rust.parse_ctm(buffer);
        const indices = ctm.indices();
        const vertices = ctm.vertices();
        const normals = ctm.normals();
        const result = { indices, vertices, normals };
        ctm.free();
        return result;
    }
    async parseQuads(buffer) {
        const rust = await rustModule;
        const sectorData = rust.parse_and_convert_f3df(buffer);
        const result = {
            buffer: sectorData.faces(),
            treeIndexToNodeIdMap: sectorData.tree_index_to_node_id_map(),
            nodeIdToTreeIndexMap: sectorData.node_id_to_tree_index_map()
        };
        sectorData.free();
        return result;
    }
    extractParsedPrimitives(sectorData) {
        const boxCollection = sectorData.box_collection();
        const boxAttributes = this.convertToJSMemory(sectorData.box_attributes());
        const circleCollection = sectorData.circle_collection();
        const circleAttributes = this.convertToJSMemory(sectorData.circle_attributes());
        const coneCollection = sectorData.cone_collection();
        const coneAttributes = this.convertToJSMemory(sectorData.cone_attributes());
        const eccentricConeCollection = sectorData.eccentric_cone_collection();
        const eccentricConeAttributes = this.convertToJSMemory(sectorData.eccentric_cone_attributes());
        const ellipsoidSegmentCollection = sectorData.ellipsoid_segment_collection();
        const ellipsoidSegmentAttributes = this.convertToJSMemory(sectorData.ellipsoid_segment_attributes());
        const generalCylinderCollection = sectorData.general_cylinder_collection();
        const generalCylinderAttributes = this.convertToJSMemory(sectorData.general_cylinder_attributes());
        const generalRingCollection = sectorData.general_ring_collection();
        const generalRingAttributes = this.convertToJSMemory(sectorData.general_ring_attributes());
        const nutCollection = sectorData.nut_collection();
        const nutAttributes = this.convertToJSMemory(sectorData.nut_attributes());
        const quadCollection = sectorData.quad_collection();
        const quadAttributes = this.convertToJSMemory(sectorData.quad_attributes());
        const sphericalSegmentCollection = sectorData.spherical_segment_collection();
        const sphericalSegmentAttributes = this.convertToJSMemory(sectorData.spherical_segment_attributes());
        const torusSegmentCollection = sectorData.torus_segment_collection();
        const torusSegmentAttributes = this.convertToJSMemory(sectorData.torus_segment_attributes());
        const trapeziumCollection = sectorData.trapezium_collection();
        const trapeziumAttributes = this.convertToJSMemory(sectorData.trapezium_attributes());
        const parsedPrimitives = {
            boxCollection,
            boxAttributes,
            circleCollection,
            circleAttributes,
            coneCollection,
            coneAttributes,
            eccentricConeCollection,
            eccentricConeAttributes,
            ellipsoidSegmentCollection,
            ellipsoidSegmentAttributes,
            generalCylinderCollection,
            generalCylinderAttributes,
            generalRingCollection,
            generalRingAttributes,
            nutCollection,
            nutAttributes,
            quadCollection,
            quadAttributes,
            sphericalSegmentCollection,
            sphericalSegmentAttributes,
            torusSegmentCollection,
            torusSegmentAttributes,
            trapeziumCollection,
            trapeziumAttributes
        };
        return parsedPrimitives;
    }
    extractTriangleMeshes(sectorData) {
        const collection = sectorData.triangle_mesh_collection();
        const result = {
            fileIds: collection.file_id().slice(),
            treeIndices: collection.tree_index().slice(),
            colors: collection.color().slice(),
            triangleCounts: collection.triangle_count().slice(),
            sizes: collection.size().slice()
        };
        collection.free();
        return result;
    }
    extractInstanceMeshes(sectorData) {
        const collection = sectorData.instanced_mesh_collection();
        const result = {
            fileIds: collection.file_id().slice(),
            treeIndices: collection.tree_index().slice(),
            colors: collection.color().slice(),
            triangleOffsets: collection.triangle_offset().slice(),
            triangleCounts: collection.triangle_count().slice(),
            sizes: collection.size().slice(),
            instanceMatrices: collection.instance_matrix().slice()
        };
        collection.free();
        return result;
    }
    convertToJSMemory(rustAttributes) {
        const jsAttributes = new Map();
        for (const entry of rustAttributes.entries()) {
            const [key, attribute] = entry;
            jsAttributes.set(key, { size: attribute.size, offset: attribute.offset });
            attribute.free();
        }
        return jsAttributes;
    }
}
const obj = new RevealParserWorker();
comlink__WEBPACK_IMPORTED_MODULE_0__["expose"](obj);


/***/ }),

/***/ "comlink":
/*!**************************!*\
  !*** external "comlink" ***!
  \**************************/
/*! no static exports found */
/*! exports used: expose */
/***/ (function(module, exports) {

module.exports = require("comlink");

/***/ })

/******/ });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbGl0aWVzL3dvcmtlcnMvcmV2ZWFsLnBhcnNlci53b3JrZXIudHMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY29tbGlua1wiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPO1FDVkE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUEsNkJBQTZCLDBCQUEwQjs7UUFFdkQ7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FBQ0EsT0FBTztRQUNQO1FBQ0E7UUFDQSxPQUFPO1FBQ1A7UUFDQTtRQUNBLE9BQU87UUFDUDtRQUNBO1FB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O0FBRXJDLDhDQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUM1TXBCLG9DIiwiZmlsZSI6InJldmVhbC5wYXJzZXIud29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIHtcblx0XHR2YXIgYSA9IGZhY3RvcnkoKTtcblx0XHRmb3IodmFyIGkgaW4gYSkgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyA/IGV4cG9ydHMgOiByb290KVtpXSA9IGFbaV07XG5cdH1cbn0pKCh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyksIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIiBcdCh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcylbXCJ3ZWJwYWNrQ2h1bmtcIl0gPSBmdW5jdGlvbiB3ZWJwYWNrQ2h1bmtDYWxsYmFjayhjaHVua0lkcywgbW9yZU1vZHVsZXMpIHtcbiBcdFx0Zm9yKHZhciBtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuIFx0XHRcdG1vZHVsZXNbbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuIFx0XHR9XG4gXHRcdHdoaWxlKGNodW5rSWRzLmxlbmd0aClcbiBcdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZHMucG9wKCldID0gMTtcbiBcdH07XG5cbiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgY2h1bmtzXG4gXHQvLyBcIjFcIiBtZWFucyBcImFscmVhZHkgbG9hZGVkXCJcbiBcdHZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG4gXHRcdFwicmV2ZWFsLnBhcnNlci53b3JrZXJcIjogMVxuIFx0fTtcblxuIFx0Ly8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyB3YXNtIG1vZHVsZXNcbiBcdHZhciBpbnN0YWxsZWRXYXNtTW9kdWxlcyA9IHt9O1xuXG4gXHRmdW5jdGlvbiBwcm9taXNlUmVzb2x2ZSgpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyB9XG5cbiBcdHZhciB3YXNtSW1wb3J0T2JqZWN0cyA9IHtcbiBcdFx0XCIuL3BrZy9pbmRleF9iZy53YXNtXCI6IGZ1bmN0aW9uKCkge1xuIFx0XHRcdHJldHVybiB7XG4gXHRcdFx0XHRcIi4vaW5kZXhfYmcuanNcIjoge1xuIFx0XHRcdFx0XHRcIl9fd2JnX3BhcnNlcmVycm9yX25ld1wiOiBmdW5jdGlvbihwMGkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIk5cIl0ocDBpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JpbmRnZW5fb2JqZWN0X2Ryb3BfcmVmXCI6IGZ1bmN0aW9uKHAwaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiVVwiXShwMGkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmluZGdlbl9zdHJpbmdfbmV3XCI6IGZ1bmN0aW9uKHAwaTMyLHAxaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiV1wiXShwMGkzMixwMWkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmluZGdlbl9vYmplY3RfY2xvbmVfcmVmXCI6IGZ1bmN0aW9uKHAwaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiVFwiXShwMGkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmdfbmV3XzU5Y2I3NGU0MjM3NThlZGVcIjogZnVuY3Rpb24oKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiRVwiXSgpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX3N0YWNrXzU1OGJhNTkxN2I0NjZlZGRcIjogZnVuY3Rpb24ocDBpMzIscDFpMzIpIHtcbiBcdFx0XHRcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1tcIi4vcGtnL2luZGV4X2JnLmpzXCJdLmV4cG9ydHNbXCJRXCJdKHAwaTMyLHAxaTMyKTtcbiBcdFx0XHRcdFx0fSxcbiBcdFx0XHRcdFx0XCJfX3diZ19lcnJvcl80YmI2YzJhOTc0MDcxMjlhXCI6IGZ1bmN0aW9uKHAwaTMyLHAxaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiQVwiXShwMGkzMixwMWkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmdfYXR0cmlidXRlX25ld1wiOiBmdW5jdGlvbihwMGkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcInlcIl0ocDBpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JpbmRnZW5fbnVtYmVyX25ld1wiOiBmdW5jdGlvbihwMGY2NCkge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIlNcIl0ocDBmNjQpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX25ld182YjZmMzQ2YjQ5MTJjZGFlXCI6IGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIkZcIl0oKTtcbiBcdFx0XHRcdFx0fSxcbiBcdFx0XHRcdFx0XCJfX3diZ19wdXNoX2YzNTMxMDhlMjBlYzY3YTBcIjogZnVuY3Rpb24ocDBpMzIscDFpMzIpIHtcbiBcdFx0XHRcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1tcIi4vcGtnL2luZGV4X2JnLmpzXCJdLmV4cG9ydHNbXCJPXCJdKHAwaTMyLHAxaTMyKTtcbiBcdFx0XHRcdFx0fSxcbiBcdFx0XHRcdFx0XCJfX3diZ19uZXdfZDMzM2E2ZTU2NzEzM2ZkYlwiOiBmdW5jdGlvbihwMGkzMixwMWkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIkhcIl0ocDBpMzIscDFpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX25ld180ZDYzYjQ2YmRmZjZlMTZjXCI6IGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIkRcIl0oKTtcbiBcdFx0XHRcdFx0fSxcbiBcdFx0XHRcdFx0XCJfX3diZ19zZXRfZGZhMmYxYTQyY2IyNDUzMlwiOiBmdW5jdGlvbihwMGkzMixwMWkzMixwMmkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIlBcIl0ocDBpMzIscDFpMzIscDJpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX2J1ZmZlcl80NDg1NWFlZmE4M2VhNDhjXCI6IGZ1bmN0aW9uKHAwaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wielwiXShwMGkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmdfbmV3d2l0aGJ5dGVvZmZzZXRhbmRsZW5ndGhfMGRhODZkYWQ0ZDU1ZmJhZVwiOiBmdW5jdGlvbihwMGkzMixwMWkzMixwMmkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIkpcIl0ocDBpMzIscDFpMzIscDJpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX25ld18wNDc5M2QyYzA5YmEwNjBmXCI6IGZ1bmN0aW9uKHAwaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiQlwiXShwMGkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmdfbmV3d2l0aGJ5dGVvZmZzZXRhbmRsZW5ndGhfYjg2ZGRhOGMzNzI1NWNhM1wiOiBmdW5jdGlvbihwMGkzMixwMWkzMixwMmkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIkxcIl0ocDBpMzIscDFpMzIscDJpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX25ld19hMGI2M2Q1NWYyMmRhZjcyXCI6IGZ1bmN0aW9uKHAwaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiR1wiXShwMGkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmdfbmV3d2l0aGJ5dGVvZmZzZXRhbmRsZW5ndGhfYzlmODRkMDk1MDg1NDNjNlwiOiBmdW5jdGlvbihwMGkzMixwMWkzMixwMmkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIk1cIl0ocDBpMzIscDFpMzIscDJpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX25ld18wNTAyMGQ4OThmZWU5MjkxXCI6IGZ1bmN0aW9uKHAwaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiQ1wiXShwMGkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmdfbmV3d2l0aGJ5dGVvZmZzZXRhbmRsZW5ndGhfYjJiZjE5ZWM3NjA3MWVkOFwiOiBmdW5jdGlvbihwMGkzMixwMWkzMixwMmkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIktcIl0ocDBpMzIscDFpMzIscDJpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JnX25ld19lZDk0ZWJiMGFlMDQyNGUzXCI6IGZ1bmN0aW9uKHAwaTMyKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbXCIuL3BrZy9pbmRleF9iZy5qc1wiXS5leHBvcnRzW1wiSVwiXShwMGkzMik7XG4gXHRcdFx0XHRcdH0sXG4gXHRcdFx0XHRcdFwiX193YmluZGdlbl90aHJvd1wiOiBmdW5jdGlvbihwMGkzMixwMWkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIlhcIl0ocDBpMzIscDFpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JpbmRnZW5fcmV0aHJvd1wiOiBmdW5jdGlvbihwMGkzMikge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIlZcIl0ocDBpMzIpO1xuIFx0XHRcdFx0XHR9LFxuIFx0XHRcdFx0XHRcIl9fd2JpbmRnZW5fbWVtb3J5XCI6IGZ1bmN0aW9uKCkge1xuIFx0XHRcdFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW1wiLi9wa2cvaW5kZXhfYmcuanNcIl0uZXhwb3J0c1tcIlJcIl0oKTtcbiBcdFx0XHRcdFx0fVxuIFx0XHRcdFx0fVxuIFx0XHRcdH07XG4gXHRcdH0sXG4gXHR9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cbiBcdC8vIFRoaXMgZmlsZSBjb250YWlucyBvbmx5IHRoZSBlbnRyeSBjaHVuay5cbiBcdC8vIFRoZSBjaHVuayBsb2FkaW5nIGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIGNodW5rc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5lID0gZnVuY3Rpb24gcmVxdWlyZUVuc3VyZShjaHVua0lkKSB7XG4gXHRcdHZhciBwcm9taXNlcyA9IFtdO1xuIFx0XHRwcm9taXNlcy5wdXNoKFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gXHRcdFx0Ly8gXCIxXCIgaXMgdGhlIHNpZ25hbCBmb3IgXCJhbHJlYWR5IGxvYWRlZFwiXG4gXHRcdFx0aWYoIWluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuIFx0XHRcdFx0aW1wb3J0U2NyaXB0cyhfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBcIlwiICsgKHt9W2NodW5rSWRdfHxjaHVua0lkKSArIFwiLmpzXCIpO1xuIFx0XHRcdH1cbiBcdFx0fSkpO1xuXG4gXHRcdC8vIEZldGNoICsgY29tcGlsZSBjaHVuayBsb2FkaW5nIGZvciB3ZWJhc3NlbWJseVxuXG4gXHRcdHZhciB3YXNtTW9kdWxlcyA9IHtcIjBcIjpbXCIuL3BrZy9pbmRleF9iZy53YXNtXCJdfVtjaHVua0lkXSB8fCBbXTtcblxuIFx0XHR3YXNtTW9kdWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHdhc21Nb2R1bGVJZCkge1xuIFx0XHRcdHZhciBpbnN0YWxsZWRXYXNtTW9kdWxlRGF0YSA9IGluc3RhbGxlZFdhc21Nb2R1bGVzW3dhc21Nb2R1bGVJZF07XG5cbiBcdFx0XHQvLyBhIFByb21pc2UgbWVhbnMgXCJjdXJyZW50bHkgbG9hZGluZ1wiIG9yIFwiYWxyZWFkeSBsb2FkZWRcIi5cbiBcdFx0XHRpZihpbnN0YWxsZWRXYXNtTW9kdWxlRGF0YSlcbiBcdFx0XHRcdHByb21pc2VzLnB1c2goaW5zdGFsbGVkV2FzbU1vZHVsZURhdGEpO1xuIFx0XHRcdGVsc2Uge1xuIFx0XHRcdFx0dmFyIGltcG9ydE9iamVjdCA9IHdhc21JbXBvcnRPYmplY3RzW3dhc21Nb2R1bGVJZF0oKTtcbiBcdFx0XHRcdHZhciByZXEgPSBmZXRjaChfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBcIlwiICsge1wiLi9wa2cvaW5kZXhfYmcud2FzbVwiOlwiNTZlNjBjYWM3ZDE1NmVjZGM1NjhcIn1bd2FzbU1vZHVsZUlkXSArIFwiLm1vZHVsZS53YXNtXCIpO1xuIFx0XHRcdFx0dmFyIHByb21pc2U7XG4gXHRcdFx0XHRpZihpbXBvcnRPYmplY3QgaW5zdGFuY2VvZiBQcm9taXNlICYmIHR5cGVvZiBXZWJBc3NlbWJseS5jb21waWxlU3RyZWFtaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gXHRcdFx0XHRcdHByb21pc2UgPSBQcm9taXNlLmFsbChbV2ViQXNzZW1ibHkuY29tcGlsZVN0cmVhbWluZyhyZXEpLCBpbXBvcnRPYmplY3RdKS50aGVuKGZ1bmN0aW9uKGl0ZW1zKSB7XG4gXHRcdFx0XHRcdFx0cmV0dXJuIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGl0ZW1zWzBdLCBpdGVtc1sxXSk7XG4gXHRcdFx0XHRcdH0pO1xuIFx0XHRcdFx0fSBlbHNlIGlmKHR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyA9PT0gJ2Z1bmN0aW9uJykge1xuIFx0XHRcdFx0XHRwcm9taXNlID0gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcocmVxLCBpbXBvcnRPYmplY3QpO1xuIFx0XHRcdFx0fSBlbHNlIHtcbiBcdFx0XHRcdFx0dmFyIGJ5dGVzUHJvbWlzZSA9IHJlcS50aGVuKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHguYXJyYXlCdWZmZXIoKTsgfSk7XG4gXHRcdFx0XHRcdHByb21pc2UgPSBieXRlc1Byb21pc2UudGhlbihmdW5jdGlvbihieXRlcykge1xuIFx0XHRcdFx0XHRcdHJldHVybiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShieXRlcywgaW1wb3J0T2JqZWN0KTtcbiBcdFx0XHRcdFx0fSk7XG4gXHRcdFx0XHR9XG4gXHRcdFx0XHRwcm9taXNlcy5wdXNoKGluc3RhbGxlZFdhc21Nb2R1bGVzW3dhc21Nb2R1bGVJZF0gPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gXHRcdFx0XHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLndbd2FzbU1vZHVsZUlkXSA9IChyZXMuaW5zdGFuY2UgfHwgcmVzKS5leHBvcnRzO1xuIFx0XHRcdFx0fSkpO1xuIFx0XHRcdH1cbiBcdFx0fSk7XG4gXHRcdHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gXHR9O1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiaHR0cHM6Ly91bnBrZy5jb20vbW4tcmV2ZWFsLXdvcmtlci10ZXN0QDAuMC42L1wiO1xuXG4gXHQvLyBvYmplY3Qgd2l0aCBhbGwgV2ViQXNzZW1ibHkuaW5zdGFuY2UgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy53ID0ge307XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3V0aWxpdGllcy93b3JrZXJzL3JldmVhbC5wYXJzZXIud29ya2VyLnRzXCIpO1xuIiwiLyohXG4gKiBDb3B5cmlnaHQgMjAyMCBDb2duaXRlIEFTXG4gKi9cblxuaW1wb3J0ICogYXMgQ29tbGluayBmcm9tICdjb21saW5rJztcbmltcG9ydCB7XG4gIFBhcnNlU2VjdG9yUmVzdWx0LFxuICBQYXJzZUN0bVJlc3VsdCxcbiAgUGFyc2VkUHJpbWl0aXZlcyxcbiAgUGFyc2VQcmltaXRpdmVBdHRyaWJ1dGVcbn0gZnJvbSAnLi90eXBlcy9yZXZlYWwucGFyc2VyLnR5cGVzJztcbmltcG9ydCAqIGFzIHJ1c3RUeXBlcyBmcm9tICcuLi8uLi8uLi9wa2cnO1xuaW1wb3J0IHsgU2VjdG9yUXVhZHMgfSBmcm9tICdAL2RhdGFtb2RlbHMvY2FkL3JlbmRlcmluZy90eXBlcyc7XG5jb25zdCBydXN0TW9kdWxlID0gaW1wb3J0KCcuLi8uLi8uLi9wa2cnKTtcblxuZXhwb3J0IGNsYXNzIFJldmVhbFBhcnNlcldvcmtlciB7XG4gIHB1YmxpYyBhc3luYyBwYXJzZVNlY3RvcihidWZmZXI6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFBhcnNlU2VjdG9yUmVzdWx0PiB7XG4gICAgY29uc3QgcnVzdCA9IGF3YWl0IHJ1c3RNb2R1bGU7XG4gICAgY29uc3Qgc2VjdG9yRGF0YSA9IHJ1c3QucGFyc2VfYW5kX2NvbnZlcnRfc2VjdG9yKGJ1ZmZlcik7XG5cbiAgICBjb25zdCBpbnN0YW5jZU1lc2hlcyA9IHRoaXMuZXh0cmFjdEluc3RhbmNlTWVzaGVzKHNlY3RvckRhdGEpO1xuXG4gICAgY29uc3QgdHJpYW5nbGVNZXNoZXMgPSB0aGlzLmV4dHJhY3RUcmlhbmdsZU1lc2hlcyhzZWN0b3JEYXRhKTtcblxuICAgIGNvbnN0IHBhcnNlZFByaW1pdGl2ZXMgPSB0aGlzLmV4dHJhY3RQYXJzZWRQcmltaXRpdmVzKHNlY3RvckRhdGEpO1xuXG4gICAgY29uc3QgcGFyc2VSZXN1bHQ6IFBhcnNlU2VjdG9yUmVzdWx0ID0ge1xuICAgICAgdHJlZUluZGV4VG9Ob2RlSWRNYXA6IHNlY3RvckRhdGEudHJlZV9pbmRleF90b19ub2RlX2lkX21hcCgpLFxuICAgICAgbm9kZUlkVG9UcmVlSW5kZXhNYXA6IHNlY3RvckRhdGEubm9kZV9pZF90b190cmVlX2luZGV4X21hcCgpLFxuICAgICAgcHJpbWl0aXZlczogcGFyc2VkUHJpbWl0aXZlcyxcbiAgICAgIGluc3RhbmNlTWVzaGVzLFxuICAgICAgdHJpYW5nbGVNZXNoZXNcbiAgICB9O1xuXG4gICAgc2VjdG9yRGF0YS5mcmVlKCk7XG5cbiAgICByZXR1cm4gcGFyc2VSZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcGFyc2VDdG0oYnVmZmVyOiBVaW50OEFycmF5KTogUHJvbWlzZTxQYXJzZUN0bVJlc3VsdD4ge1xuICAgIGNvbnN0IHJ1c3QgPSBhd2FpdCBydXN0TW9kdWxlO1xuXG4gICAgLy8gVE9ETyBoYW5kbGUgcGFyc2luZyBmYWlsdXJlXG4gICAgY29uc3QgY3RtID0gcnVzdC5wYXJzZV9jdG0oYnVmZmVyKTtcblxuICAgIGNvbnN0IGluZGljZXMgPSBjdG0uaW5kaWNlcygpO1xuICAgIGNvbnN0IHZlcnRpY2VzID0gY3RtLnZlcnRpY2VzKCk7XG4gICAgY29uc3Qgbm9ybWFscyA9IGN0bS5ub3JtYWxzKCk7XG5cbiAgICBjb25zdCByZXN1bHQgPSB7IGluZGljZXMsIHZlcnRpY2VzLCBub3JtYWxzIH07XG5cbiAgICBjdG0uZnJlZSgpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwYXJzZVF1YWRzKGJ1ZmZlcjogVWludDhBcnJheSk6IFByb21pc2U8U2VjdG9yUXVhZHM+IHtcbiAgICBjb25zdCBydXN0ID0gYXdhaXQgcnVzdE1vZHVsZTtcblxuICAgIGNvbnN0IHNlY3RvckRhdGEgPSBydXN0LnBhcnNlX2FuZF9jb252ZXJ0X2YzZGYoYnVmZmVyKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGJ1ZmZlcjogc2VjdG9yRGF0YS5mYWNlcygpLFxuICAgICAgdHJlZUluZGV4VG9Ob2RlSWRNYXA6IHNlY3RvckRhdGEudHJlZV9pbmRleF90b19ub2RlX2lkX21hcCgpLFxuICAgICAgbm9kZUlkVG9UcmVlSW5kZXhNYXA6IHNlY3RvckRhdGEubm9kZV9pZF90b190cmVlX2luZGV4X21hcCgpXG4gICAgfTtcblxuICAgIHNlY3RvckRhdGEuZnJlZSgpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdFBhcnNlZFByaW1pdGl2ZXMoc2VjdG9yRGF0YTogcnVzdFR5cGVzLlNlY3Rvcikge1xuICAgIGNvbnN0IGJveENvbGxlY3Rpb24gPSBzZWN0b3JEYXRhLmJveF9jb2xsZWN0aW9uKCk7XG4gICAgY29uc3QgYm94QXR0cmlidXRlcyA9IHRoaXMuY29udmVydFRvSlNNZW1vcnkoc2VjdG9yRGF0YS5ib3hfYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+KTtcblxuICAgIGNvbnN0IGNpcmNsZUNvbGxlY3Rpb24gPSBzZWN0b3JEYXRhLmNpcmNsZV9jb2xsZWN0aW9uKCk7XG4gICAgY29uc3QgY2lyY2xlQXR0cmlidXRlcyA9IHRoaXMuY29udmVydFRvSlNNZW1vcnkoc2VjdG9yRGF0YS5jaXJjbGVfYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+KTtcblxuICAgIGNvbnN0IGNvbmVDb2xsZWN0aW9uID0gc2VjdG9yRGF0YS5jb25lX2NvbGxlY3Rpb24oKTtcbiAgICBjb25zdCBjb25lQXR0cmlidXRlcyA9IHRoaXMuY29udmVydFRvSlNNZW1vcnkoc2VjdG9yRGF0YS5jb25lX2F0dHJpYnV0ZXMoKSBhcyBNYXA8c3RyaW5nLCBydXN0VHlwZXMuQXR0cmlidXRlPik7XG5cbiAgICBjb25zdCBlY2NlbnRyaWNDb25lQ29sbGVjdGlvbiA9IHNlY3RvckRhdGEuZWNjZW50cmljX2NvbmVfY29sbGVjdGlvbigpO1xuICAgIGNvbnN0IGVjY2VudHJpY0NvbmVBdHRyaWJ1dGVzID0gdGhpcy5jb252ZXJ0VG9KU01lbW9yeShcbiAgICAgIHNlY3RvckRhdGEuZWNjZW50cmljX2NvbmVfYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+XG4gICAgKTtcblxuICAgIGNvbnN0IGVsbGlwc29pZFNlZ21lbnRDb2xsZWN0aW9uID0gc2VjdG9yRGF0YS5lbGxpcHNvaWRfc2VnbWVudF9jb2xsZWN0aW9uKCk7XG4gICAgY29uc3QgZWxsaXBzb2lkU2VnbWVudEF0dHJpYnV0ZXMgPSB0aGlzLmNvbnZlcnRUb0pTTWVtb3J5KFxuICAgICAgc2VjdG9yRGF0YS5lbGxpcHNvaWRfc2VnbWVudF9hdHRyaWJ1dGVzKCkgYXMgTWFwPHN0cmluZywgcnVzdFR5cGVzLkF0dHJpYnV0ZT5cbiAgICApO1xuXG4gICAgY29uc3QgZ2VuZXJhbEN5bGluZGVyQ29sbGVjdGlvbiA9IHNlY3RvckRhdGEuZ2VuZXJhbF9jeWxpbmRlcl9jb2xsZWN0aW9uKCk7XG4gICAgY29uc3QgZ2VuZXJhbEN5bGluZGVyQXR0cmlidXRlcyA9IHRoaXMuY29udmVydFRvSlNNZW1vcnkoXG4gICAgICBzZWN0b3JEYXRhLmdlbmVyYWxfY3lsaW5kZXJfYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+XG4gICAgKTtcblxuICAgIGNvbnN0IGdlbmVyYWxSaW5nQ29sbGVjdGlvbiA9IHNlY3RvckRhdGEuZ2VuZXJhbF9yaW5nX2NvbGxlY3Rpb24oKTtcbiAgICBjb25zdCBnZW5lcmFsUmluZ0F0dHJpYnV0ZXMgPSB0aGlzLmNvbnZlcnRUb0pTTWVtb3J5KFxuICAgICAgc2VjdG9yRGF0YS5nZW5lcmFsX3JpbmdfYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+XG4gICAgKTtcblxuICAgIGNvbnN0IG51dENvbGxlY3Rpb24gPSBzZWN0b3JEYXRhLm51dF9jb2xsZWN0aW9uKCk7XG4gICAgY29uc3QgbnV0QXR0cmlidXRlcyA9IHRoaXMuY29udmVydFRvSlNNZW1vcnkoc2VjdG9yRGF0YS5udXRfYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+KTtcblxuICAgIGNvbnN0IHF1YWRDb2xsZWN0aW9uID0gc2VjdG9yRGF0YS5xdWFkX2NvbGxlY3Rpb24oKTtcbiAgICBjb25zdCBxdWFkQXR0cmlidXRlcyA9IHRoaXMuY29udmVydFRvSlNNZW1vcnkoc2VjdG9yRGF0YS5xdWFkX2F0dHJpYnV0ZXMoKSBhcyBNYXA8c3RyaW5nLCBydXN0VHlwZXMuQXR0cmlidXRlPik7XG5cbiAgICBjb25zdCBzcGhlcmljYWxTZWdtZW50Q29sbGVjdGlvbiA9IHNlY3RvckRhdGEuc3BoZXJpY2FsX3NlZ21lbnRfY29sbGVjdGlvbigpO1xuICAgIGNvbnN0IHNwaGVyaWNhbFNlZ21lbnRBdHRyaWJ1dGVzID0gdGhpcy5jb252ZXJ0VG9KU01lbW9yeShcbiAgICAgIHNlY3RvckRhdGEuc3BoZXJpY2FsX3NlZ21lbnRfYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+XG4gICAgKTtcblxuICAgIGNvbnN0IHRvcnVzU2VnbWVudENvbGxlY3Rpb24gPSBzZWN0b3JEYXRhLnRvcnVzX3NlZ21lbnRfY29sbGVjdGlvbigpO1xuICAgIGNvbnN0IHRvcnVzU2VnbWVudEF0dHJpYnV0ZXMgPSB0aGlzLmNvbnZlcnRUb0pTTWVtb3J5KFxuICAgICAgc2VjdG9yRGF0YS50b3J1c19zZWdtZW50X2F0dHJpYnV0ZXMoKSBhcyBNYXA8c3RyaW5nLCBydXN0VHlwZXMuQXR0cmlidXRlPlxuICAgICk7XG5cbiAgICBjb25zdCB0cmFwZXppdW1Db2xsZWN0aW9uID0gc2VjdG9yRGF0YS50cmFwZXppdW1fY29sbGVjdGlvbigpO1xuICAgIGNvbnN0IHRyYXBleml1bUF0dHJpYnV0ZXMgPSB0aGlzLmNvbnZlcnRUb0pTTWVtb3J5KFxuICAgICAgc2VjdG9yRGF0YS50cmFwZXppdW1fYXR0cmlidXRlcygpIGFzIE1hcDxzdHJpbmcsIHJ1c3RUeXBlcy5BdHRyaWJ1dGU+XG4gICAgKTtcblxuICAgIGNvbnN0IHBhcnNlZFByaW1pdGl2ZXM6IFBhcnNlZFByaW1pdGl2ZXMgPSB7XG4gICAgICBib3hDb2xsZWN0aW9uLFxuICAgICAgYm94QXR0cmlidXRlcyxcbiAgICAgIGNpcmNsZUNvbGxlY3Rpb24sXG4gICAgICBjaXJjbGVBdHRyaWJ1dGVzLFxuICAgICAgY29uZUNvbGxlY3Rpb24sXG4gICAgICBjb25lQXR0cmlidXRlcyxcbiAgICAgIGVjY2VudHJpY0NvbmVDb2xsZWN0aW9uLFxuICAgICAgZWNjZW50cmljQ29uZUF0dHJpYnV0ZXMsXG4gICAgICBlbGxpcHNvaWRTZWdtZW50Q29sbGVjdGlvbixcbiAgICAgIGVsbGlwc29pZFNlZ21lbnRBdHRyaWJ1dGVzLFxuICAgICAgZ2VuZXJhbEN5bGluZGVyQ29sbGVjdGlvbixcbiAgICAgIGdlbmVyYWxDeWxpbmRlckF0dHJpYnV0ZXMsXG4gICAgICBnZW5lcmFsUmluZ0NvbGxlY3Rpb24sXG4gICAgICBnZW5lcmFsUmluZ0F0dHJpYnV0ZXMsXG4gICAgICBudXRDb2xsZWN0aW9uLFxuICAgICAgbnV0QXR0cmlidXRlcyxcbiAgICAgIHF1YWRDb2xsZWN0aW9uLFxuICAgICAgcXVhZEF0dHJpYnV0ZXMsXG4gICAgICBzcGhlcmljYWxTZWdtZW50Q29sbGVjdGlvbixcbiAgICAgIHNwaGVyaWNhbFNlZ21lbnRBdHRyaWJ1dGVzLFxuICAgICAgdG9ydXNTZWdtZW50Q29sbGVjdGlvbixcbiAgICAgIHRvcnVzU2VnbWVudEF0dHJpYnV0ZXMsXG4gICAgICB0cmFwZXppdW1Db2xsZWN0aW9uLFxuICAgICAgdHJhcGV6aXVtQXR0cmlidXRlc1xuICAgIH07XG5cbiAgICByZXR1cm4gcGFyc2VkUHJpbWl0aXZlcztcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdFRyaWFuZ2xlTWVzaGVzKHNlY3RvckRhdGE6IHJ1c3RUeXBlcy5TZWN0b3IpIHtcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gc2VjdG9yRGF0YS50cmlhbmdsZV9tZXNoX2NvbGxlY3Rpb24oKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgIGZpbGVJZHM6IGNvbGxlY3Rpb24uZmlsZV9pZCgpLnNsaWNlKCksXG4gICAgICB0cmVlSW5kaWNlczogY29sbGVjdGlvbi50cmVlX2luZGV4KCkuc2xpY2UoKSxcbiAgICAgIGNvbG9yczogY29sbGVjdGlvbi5jb2xvcigpLnNsaWNlKCksXG4gICAgICB0cmlhbmdsZUNvdW50czogY29sbGVjdGlvbi50cmlhbmdsZV9jb3VudCgpLnNsaWNlKCksXG4gICAgICBzaXplczogY29sbGVjdGlvbi5zaXplKCkuc2xpY2UoKVxuICAgIH07XG5cbiAgICBjb2xsZWN0aW9uLmZyZWUoKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RJbnN0YW5jZU1lc2hlcyhzZWN0b3JEYXRhOiBydXN0VHlwZXMuU2VjdG9yKSB7XG4gICAgY29uc3QgY29sbGVjdGlvbiA9IHNlY3RvckRhdGEuaW5zdGFuY2VkX21lc2hfY29sbGVjdGlvbigpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgZmlsZUlkczogY29sbGVjdGlvbi5maWxlX2lkKCkuc2xpY2UoKSxcbiAgICAgIHRyZWVJbmRpY2VzOiBjb2xsZWN0aW9uLnRyZWVfaW5kZXgoKS5zbGljZSgpLFxuICAgICAgY29sb3JzOiBjb2xsZWN0aW9uLmNvbG9yKCkuc2xpY2UoKSxcbiAgICAgIHRyaWFuZ2xlT2Zmc2V0czogY29sbGVjdGlvbi50cmlhbmdsZV9vZmZzZXQoKS5zbGljZSgpLFxuICAgICAgdHJpYW5nbGVDb3VudHM6IGNvbGxlY3Rpb24udHJpYW5nbGVfY291bnQoKS5zbGljZSgpLFxuICAgICAgc2l6ZXM6IGNvbGxlY3Rpb24uc2l6ZSgpLnNsaWNlKCksXG4gICAgICBpbnN0YW5jZU1hdHJpY2VzOiBjb2xsZWN0aW9uLmluc3RhbmNlX21hdHJpeCgpLnNsaWNlKClcbiAgICB9O1xuXG4gICAgY29sbGVjdGlvbi5mcmVlKCk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VG9KU01lbW9yeShydXN0QXR0cmlidXRlczogTWFwPHN0cmluZywgcnVzdFR5cGVzLkF0dHJpYnV0ZT4pOiBNYXA8c3RyaW5nLCBQYXJzZVByaW1pdGl2ZUF0dHJpYnV0ZT4ge1xuICAgIGNvbnN0IGpzQXR0cmlidXRlcyA9IG5ldyBNYXA8c3RyaW5nLCBQYXJzZVByaW1pdGl2ZUF0dHJpYnV0ZT4oKTtcblxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgcnVzdEF0dHJpYnV0ZXMuZW50cmllcygpKSB7XG4gICAgICBjb25zdCBba2V5LCBhdHRyaWJ1dGVdID0gZW50cnk7XG5cbiAgICAgIGpzQXR0cmlidXRlcy5zZXQoa2V5LCB7IHNpemU6IGF0dHJpYnV0ZS5zaXplLCBvZmZzZXQ6IGF0dHJpYnV0ZS5vZmZzZXQgfSk7XG5cbiAgICAgIGF0dHJpYnV0ZS5mcmVlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzQXR0cmlidXRlcztcbiAgfVxufVxuXG5jb25zdCBvYmogPSBuZXcgUmV2ZWFsUGFyc2VyV29ya2VyKCk7XG5cbkNvbWxpbmsuZXhwb3NlKG9iaik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjb21saW5rXCIpOyJdLCJzb3VyY2VSb290IjoiIn0=
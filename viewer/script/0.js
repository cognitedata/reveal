(typeof self !== 'undefined' ? self : this)["webpackChunk"]([0],{

/***/ "./node_modules/webpack/buildin/harmony-module.js":
/*!*******************************************!*\
  !*** (webpack)/buildin/harmony-module.js ***!
  \*******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function(originalModule) {
	if (!originalModule.webpackPolyfill) {
		var module = Object.create(originalModule);
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		Object.defineProperty(module, "exports", {
			enumerable: true
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./pkg/index.js":
/*!**********************!*\
  !*** ./pkg/index.js ***!
  \**********************/
/*! exports provided: parse_ctm, parse_and_convert_sector, parse_and_convert_f3df, test, Attribute, Box3D, Circle, CollectionStatistics, Cone, CtmResult, EccentricCone, EllipsoidSegment, GeneralCylinder, GeneralRing, InstancedMesh, Nut, ParserError, Quad, Scene, SceneStatistics, Sector, SectorStatistics, SimpleSectorData, SphericalSegment, Texture, TorusSegment, Trapezium, TriangleMesh, __wbg_parsererror_new, __wbindgen_object_drop_ref, __wbindgen_string_new, __wbindgen_object_clone_ref, __wbg_new_59cb74e423758ede, __wbg_stack_558ba5917b466edd, __wbg_error_4bb6c2a97407129a, __wbg_attribute_new, __wbindgen_number_new, __wbg_new_6b6f346b4912cdae, __wbg_push_f353108e20ec67a0, __wbg_new_d333a6e567133fdb, __wbg_new_4d63b46bdff6e16c, __wbg_set_dfa2f1a42cb24532, __wbg_buffer_44855aefa83ea48c, __wbg_newwithbyteoffsetandlength_0da86dad4d55fbae, __wbg_new_04793d2c09ba060f, __wbg_newwithbyteoffsetandlength_b86dda8c37255ca3, __wbg_new_a0b63d55f22daf72, __wbg_newwithbyteoffsetandlength_c9f84d09508543c6, __wbg_new_05020d898fee9291, __wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8, __wbg_new_ed94ebb0ae0424e3, __wbindgen_throw, __wbindgen_rethrow, __wbindgen_memory */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index_bg.wasm */ "./pkg/index_bg.wasm");
/* harmony import */ var _index_bg_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index_bg.js */ "./pkg/index_bg.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "parse_ctm", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["ab"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "parse_and_convert_sector", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["Z"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "parse_and_convert_f3df", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["Y"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "test", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["bb"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Attribute", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["a"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Box3D", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["b"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Circle", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["c"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CollectionStatistics", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["d"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cone", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["e"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CtmResult", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["f"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EccentricCone", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["g"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EllipsoidSegment", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["h"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GeneralCylinder", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["i"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GeneralRing", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["j"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InstancedMesh", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["k"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Nut", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["l"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ParserError", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["m"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Quad", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["n"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Scene", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["o"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SceneStatistics", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["p"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Sector", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["q"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SectorStatistics", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["r"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SimpleSectorData", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["s"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SphericalSegment", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["t"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Texture", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["u"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TorusSegment", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["v"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Trapezium", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["w"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TriangleMesh", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["x"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_parsererror_new", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["N"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_object_drop_ref", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["U"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_string_new", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["W"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_object_clone_ref", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["T"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_59cb74e423758ede", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["E"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_stack_558ba5917b466edd", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["Q"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_error_4bb6c2a97407129a", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["A"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_attribute_new", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["y"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_number_new", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["S"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_6b6f346b4912cdae", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["F"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_push_f353108e20ec67a0", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["O"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_d333a6e567133fdb", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["H"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_4d63b46bdff6e16c", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["D"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_set_dfa2f1a42cb24532", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["P"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_buffer_44855aefa83ea48c", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["z"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_newwithbyteoffsetandlength_0da86dad4d55fbae", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["J"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_04793d2c09ba060f", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["B"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_newwithbyteoffsetandlength_b86dda8c37255ca3", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["L"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_a0b63d55f22daf72", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["G"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_newwithbyteoffsetandlength_c9f84d09508543c6", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["M"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_05020d898fee9291", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["C"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["K"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbg_new_ed94ebb0ae0424e3", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["I"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_throw", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["X"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_rethrow", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["V"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_memory", function() { return _index_bg_js__WEBPACK_IMPORTED_MODULE_1__["R"]; });




/***/ }),

/***/ "./pkg/index_bg.js":
/*!*************************!*\
  !*** ./pkg/index_bg.js ***!
  \*************************/
/*! exports provided: parse_ctm, parse_and_convert_sector, parse_and_convert_f3df, test, Attribute, Box3D, Circle, CollectionStatistics, Cone, CtmResult, EccentricCone, EllipsoidSegment, GeneralCylinder, GeneralRing, InstancedMesh, Nut, ParserError, Quad, Scene, SceneStatistics, Sector, SectorStatistics, SimpleSectorData, SphericalSegment, Texture, TorusSegment, Trapezium, TriangleMesh, __wbg_parsererror_new, __wbindgen_object_drop_ref, __wbindgen_string_new, __wbindgen_object_clone_ref, __wbg_new_59cb74e423758ede, __wbg_stack_558ba5917b466edd, __wbg_error_4bb6c2a97407129a, __wbg_attribute_new, __wbindgen_number_new, __wbg_new_6b6f346b4912cdae, __wbg_push_f353108e20ec67a0, __wbg_new_d333a6e567133fdb, __wbg_new_4d63b46bdff6e16c, __wbg_set_dfa2f1a42cb24532, __wbg_buffer_44855aefa83ea48c, __wbg_newwithbyteoffsetandlength_0da86dad4d55fbae, __wbg_new_04793d2c09ba060f, __wbg_newwithbyteoffsetandlength_b86dda8c37255ca3, __wbg_new_a0b63d55f22daf72, __wbg_newwithbyteoffsetandlength_c9f84d09508543c6, __wbg_new_05020d898fee9291, __wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8, __wbg_new_ed94ebb0ae0424e3, __wbindgen_throw, __wbindgen_rethrow, __wbindgen_memory */
/*! exports used: Attribute, Box3D, Circle, CollectionStatistics, Cone, CtmResult, EccentricCone, EllipsoidSegment, GeneralCylinder, GeneralRing, InstancedMesh, Nut, ParserError, Quad, Scene, SceneStatistics, Sector, SectorStatistics, SimpleSectorData, SphericalSegment, Texture, TorusSegment, Trapezium, TriangleMesh, __wbg_attribute_new, __wbg_buffer_44855aefa83ea48c, __wbg_error_4bb6c2a97407129a, __wbg_new_04793d2c09ba060f, __wbg_new_05020d898fee9291, __wbg_new_4d63b46bdff6e16c, __wbg_new_59cb74e423758ede, __wbg_new_6b6f346b4912cdae, __wbg_new_a0b63d55f22daf72, __wbg_new_d333a6e567133fdb, __wbg_new_ed94ebb0ae0424e3, __wbg_newwithbyteoffsetandlength_0da86dad4d55fbae, __wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8, __wbg_newwithbyteoffsetandlength_b86dda8c37255ca3, __wbg_newwithbyteoffsetandlength_c9f84d09508543c6, __wbg_parsererror_new, __wbg_push_f353108e20ec67a0, __wbg_set_dfa2f1a42cb24532, __wbg_stack_558ba5917b466edd, __wbindgen_memory, __wbindgen_number_new, __wbindgen_object_clone_ref, __wbindgen_object_drop_ref, __wbindgen_rethrow, __wbindgen_string_new, __wbindgen_throw, parse_and_convert_f3df, parse_and_convert_sector, parse_ctm, test */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ab", function() { return parse_ctm; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Z", function() { return parse_and_convert_sector; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Y", function() { return parse_and_convert_f3df; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bb", function() { return test; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Attribute; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Box3D; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return Circle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return CollectionStatistics; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return Cone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return CtmResult; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return EccentricCone; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return EllipsoidSegment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return GeneralCylinder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return GeneralRing; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return InstancedMesh; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return Nut; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return ParserError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return Quad; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return Scene; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return SceneStatistics; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return Sector; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return SectorStatistics; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return SimpleSectorData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return SphericalSegment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return Texture; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return TorusSegment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return Trapezium; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return TriangleMesh; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "N", function() { return __wbg_parsererror_new; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "U", function() { return __wbindgen_object_drop_ref; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "W", function() { return __wbindgen_string_new; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "T", function() { return __wbindgen_object_clone_ref; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "E", function() { return __wbg_new_59cb74e423758ede; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Q", function() { return __wbg_stack_558ba5917b466edd; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "A", function() { return __wbg_error_4bb6c2a97407129a; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "y", function() { return __wbg_attribute_new; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "S", function() { return __wbindgen_number_new; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "F", function() { return __wbg_new_6b6f346b4912cdae; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "O", function() { return __wbg_push_f353108e20ec67a0; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "H", function() { return __wbg_new_d333a6e567133fdb; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "D", function() { return __wbg_new_4d63b46bdff6e16c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "P", function() { return __wbg_set_dfa2f1a42cb24532; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "z", function() { return __wbg_buffer_44855aefa83ea48c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "J", function() { return __wbg_newwithbyteoffsetandlength_0da86dad4d55fbae; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "B", function() { return __wbg_new_04793d2c09ba060f; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "L", function() { return __wbg_newwithbyteoffsetandlength_b86dda8c37255ca3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "G", function() { return __wbg_new_a0b63d55f22daf72; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "M", function() { return __wbg_newwithbyteoffsetandlength_c9f84d09508543c6; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "C", function() { return __wbg_new_05020d898fee9291; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "K", function() { return __wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I", function() { return __wbg_new_ed94ebb0ae0424e3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "X", function() { return __wbindgen_throw; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "V", function() { return __wbindgen_rethrow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "R", function() { return __wbindgen_memory; });
/* harmony import */ var _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index_bg.wasm */ "./pkg/index_bg.wasm");


const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "Ab"].buffer) {
        cachegetUint8Memory0 = new Uint8Array(_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "Ab"].buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {Uint8Array} input
* @returns {CtmResult}
*/
function parse_ctm(input) {
    var ptr0 = passArray8ToWasm0(input, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_malloc */ "lb"]);
    var len0 = WASM_VECTOR_LEN;
    var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* parse_ctm */ "Db"](ptr0, len0);
    return CtmResult.__wrap(ret);
}

/**
* @param {Uint8Array} input
* @returns {Sector}
*/
function parse_and_convert_sector(input) {
    var ptr0 = passArray8ToWasm0(input, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_malloc */ "lb"]);
    var len0 = WASM_VECTOR_LEN;
    var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* parse_and_convert_sector */ "Cb"](ptr0, len0);
    return Sector.__wrap(ret);
}

/**
* @param {Uint8Array} input
* @returns {SimpleSectorData}
*/
function parse_and_convert_f3df(input) {
    var ptr0 = passArray8ToWasm0(input, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_malloc */ "lb"]);
    var len0 = WASM_VECTOR_LEN;
    var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* parse_and_convert_f3df */ "Bb"](ptr0, len0);
    return SimpleSectorData.__wrap(ret);
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "Ab"].buffer) {
        cachegetInt32Memory0 = new Int32Array(_index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "Ab"].buffer);
    }
    return cachegetInt32Memory0;
}
/**
* @returns {string}
*/
function test() {
    try {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* test */ "oc"](8);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_free */ "kb"](r0, r1);
    }
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
*/
class Attribute {

    static __wrap(ptr) {
        const obj = Object.create(Attribute.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_attribute_free */ "a"](ptr);
    }
    /**
    * @returns {number}
    */
    get size() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_attribute_size */ "l"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set size(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_attribute_size */ "M"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get offset() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_attribute_offset */ "k"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set offset(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_attribute_offset */ "L"](this.ptr, arg0);
    }
}
/**
*/
class Box3D {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_box3d_free */ "b"](ptr);
    }
}
/**
*/
class Circle {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_circle_free */ "c"](ptr);
    }
}
/**
*/
class CollectionStatistics {

    static __wrap(ptr) {
        const obj = Object.create(CollectionStatistics.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_collectionstatistics_free */ "d"](ptr);
    }
    /**
    * @returns {number}
    */
    get box_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_attribute_size */ "l"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set box_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_attribute_size */ "M"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get cone_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_cone_collection */ "n"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set cone_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_cone_collection */ "O"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get circle_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_circle_collection */ "m"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set circle_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_circle_collection */ "N"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get eccentric_cone_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_eccentric_cone_collection */ "o"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set eccentric_cone_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_eccentric_cone_collection */ "P"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get ellipsoid_segment_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_ellipsoid_segment_collection */ "p"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set ellipsoid_segment_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_ellipsoid_segment_collection */ "Q"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get general_ring_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_general_ring_collection */ "r"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set general_ring_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_general_ring_collection */ "S"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get general_cylinder_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_general_cylinder_collection */ "q"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set general_cylinder_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_general_cylinder_collection */ "R"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get nut_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_nut_collection */ "s"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set nut_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_nut_collection */ "T"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get quad_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_quad_collection */ "t"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set quad_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_quad_collection */ "U"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get spherical_segment_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_spherical_segment_collection */ "u"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set spherical_segment_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_spherical_segment_collection */ "V"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get torus_segment_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_torus_segment_collection */ "v"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set torus_segment_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_torus_segment_collection */ "W"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get trapezium_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_trapezium_collection */ "w"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set trapezium_collection(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_collectionstatistics_trapezium_collection */ "X"](this.ptr, arg0);
    }
}
/**
*/
class Cone {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_cone_free */ "e"](ptr);
    }
}
/**
*/
class CtmResult {

    static __wrap(ptr) {
        const obj = Object.create(CtmResult.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_ctmresult_free */ "f"](ptr);
    }
    /**
    * @returns {Uint32Array}
    */
    indices() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* ctmresult_indices */ "nb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array}
    */
    vertices() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* ctmresult_vertices */ "pb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array | undefined}
    */
    normals() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* ctmresult_normals */ "ob"](this.ptr);
        return takeObject(ret);
    }
}
/**
*/
class EccentricCone {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_eccentriccone_free */ "g"](ptr);
    }
}
/**
*/
class EllipsoidSegment {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_ellipsoidsegment_free */ "h"](ptr);
    }
}
/**
*/
class GeneralCylinder {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_generalcylinder_free */ "i"](ptr);
    }
}
/**
*/
class GeneralRing {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_generalring_free */ "j"](ptr);
    }
}
/**
*/
class InstancedMesh {

    static __wrap(ptr) {
        const obj = Object.create(InstancedMesh.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_instancedmesh_free */ "D"](ptr);
    }
    /**
    * @returns {Float32Array}
    */
    tree_index() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_tree_index */ "xb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array}
    */
    size() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_size */ "vb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float64Array}
    */
    file_id() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_file_id */ "rb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float64Array}
    */
    triangle_count() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_triangle_count */ "yb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float64Array}
    */
    triangle_offset() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_triangle_offset */ "zb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    color() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_color */ "qb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array}
    */
    translation() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_translation */ "wb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array}
    */
    rotation() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_rotation */ "tb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array}
    */
    scale() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_scale */ "ub"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array}
    */
    instance_matrix() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_instance_matrix */ "sb"](this.ptr);
        return takeObject(ret);
    }
}
/**
*/
class Nut {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_nut_free */ "E"](ptr);
    }
}
/**
*/
class ParserError {

    static __wrap(ptr) {
        const obj = Object.create(ParserError.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_parsererror_free */ "F"](ptr);
    }
}
/**
*/
class Quad {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_quad_free */ "G"](ptr);
    }
}
/**
*/
class Scene {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_scene_free */ "H"](ptr);
    }
    /**
    * @returns {number}
    */
    get root_sector_id() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_attribute_size */ "l"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set root_sector_id(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_attribute_size */ "M"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    sector_count() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_collectionstatistics_eccentric_cone_collection */ "o"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {number}
    */
    sector_id(index) {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* scene_sector_id */ "Hb"](this.ptr, index);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {any}
    */
    sector_parent_id(index) {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* scene_sector_parent_id */ "Ib"](this.ptr, index);
        return takeObject(ret);
    }
    /**
    * @param {number} index
    * @returns {any}
    */
    sector_bbox_min(index) {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* scene_sector_bbox_min */ "Gb"](this.ptr, index);
        return takeObject(ret);
    }
    /**
    * @param {number} index
    * @returns {any}
    */
    sector_bbox_max(index) {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* scene_sector_bbox_max */ "Fb"](this.ptr, index);
        return takeObject(ret);
    }
    /**
    * @param {number} index
    * @returns {Sector}
    */
    sector(index) {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* scene_sector */ "Eb"](this.ptr, index);
        return Sector.__wrap(ret);
    }
    /**
    * @returns {SceneStatistics}
    */
    statistics() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* scene_statistics */ "Jb"](this.ptr);
        return SceneStatistics.__wrap(ret);
    }
}
/**
*/
class SceneStatistics {

    static __wrap(ptr) {
        const obj = Object.create(SceneStatistics.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_scenestatistics_free */ "I"](ptr);
    }
    /**
    * @returns {number}
    */
    get sectors() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_attribute_size */ "l"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set sectors(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_attribute_size */ "M"](this.ptr, arg0);
    }
    /**
    * @returns {CollectionStatistics}
    */
    get collections() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_scenestatistics_collections */ "x"](this.ptr);
        return CollectionStatistics.__wrap(ret);
    }
    /**
    * @param {CollectionStatistics} arg0
    */
    set collections(arg0) {
        _assertClass(arg0, CollectionStatistics);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_scenestatistics_collections */ "Y"](this.ptr, ptr0);
    }
}
/**
*/
class Sector {

    static __wrap(ptr) {
        const obj = Object.create(Sector.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_sector_free */ "J"](ptr);
    }
    /**
    * @returns {number}
    */
    get id() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_sector_id */ "y"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set id(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_sector_id */ "Z"](this.ptr, arg0);
    }
    /**
    * @returns {number | undefined}
    */
    get parent_id() {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_sector_parent_id */ "z"](8, this.ptr);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        return r0 === 0 ? undefined : r1 >>> 0;
    }
    /**
    * @param {number | undefined} arg0
    */
    set parent_id(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_sector_parent_id */ "ab"](this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    * @returns {Uint8Array}
    */
    box_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_box_collection */ "Lb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    cone_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_cone_collection */ "Pb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    circle_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_circle_collection */ "Nb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    eccentric_cone_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_eccentric_cone_collection */ "Rb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    ellipsoid_segment_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_ellipsoid_segment_collection */ "Tb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    general_ring_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_general_ring_collection */ "Xb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    general_cylinder_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_general_cylinder_collection */ "Vb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    nut_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_nut_collection */ "ac"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    quad_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_quad_collection */ "bc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    spherical_segment_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_spherical_segment_collection */ "dc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    torus_segment_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_torus_segment_collection */ "gc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    trapezium_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_trapezium_collection */ "ic"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    box_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_box_attributes */ "Kb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    cone_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_cone_attributes */ "Ob"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    circle_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_circle_attributes */ "Mb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    eccentric_cone_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_eccentric_cone_attributes */ "Qb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    ellipsoid_segment_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_ellipsoid_segment_attributes */ "Sb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    general_ring_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_general_ring_attributes */ "Wb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    general_cylinder_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_general_cylinder_attributes */ "Ub"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    nut_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_box_attributes */ "Kb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    quad_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_box_attributes */ "Kb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    spherical_segment_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_spherical_segment_attributes */ "cc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    torus_segment_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_torus_segment_attributes */ "fc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    trapezium_attributes() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_trapezium_attributes */ "hc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {TriangleMesh}
    */
    triangle_mesh_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_triangle_mesh_collection */ "kc"](this.ptr);
        return TriangleMesh.__wrap(ret);
    }
    /**
    * @returns {InstancedMesh}
    */
    instanced_mesh_collection() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_instanced_mesh_collection */ "Yb"](this.ptr);
        return InstancedMesh.__wrap(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    tree_index_to_node_id_map() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_tree_index_to_node_id_map */ "jc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    node_id_to_tree_index_map() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_node_id_to_tree_index_map */ "Zb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {SectorStatistics}
    */
    statistics() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* sector_statistics */ "ec"](this.ptr);
        return SectorStatistics.__wrap(ret);
    }
}
/**
*/
class SectorStatistics {

    static __wrap(ptr) {
        const obj = Object.create(SectorStatistics.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_sectorstatistics_free */ "K"](ptr);
    }
    /**
    * @returns {number}
    */
    get id() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_attribute_size */ "l"](this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set id(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_attribute_size */ "M"](this.ptr, arg0);
    }
    /**
    * @returns {CollectionStatistics}
    */
    get collections() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_scenestatistics_collections */ "x"](this.ptr);
        return CollectionStatistics.__wrap(ret);
    }
    /**
    * @param {CollectionStatistics} arg0
    */
    set collections(arg0) {
        _assertClass(arg0, CollectionStatistics);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_scenestatistics_collections */ "Y"](this.ptr, ptr0);
    }
}
/**
*/
class SimpleSectorData {

    static __wrap(ptr) {
        const obj = Object.create(SimpleSectorData.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_simplesectordata_free */ "eb"](ptr);
    }
    /**
    * @returns {Float32Array}
    */
    faces() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* simplesectordata_faces */ "lc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    node_id_to_tree_index_map() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* simplesectordata_node_id_to_tree_index_map */ "mc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Map<any, any>}
    */
    tree_index_to_node_id_map() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* simplesectordata_tree_index_to_node_id_map */ "nc"](this.ptr);
        return takeObject(ret);
    }
}
/**
*/
class SphericalSegment {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_sphericalsegment_free */ "fb"](ptr);
    }
}
/**
*/
class Texture {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_texture_free */ "gb"](ptr);
    }
    /**
    * @returns {number}
    */
    get file_id() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_texture_file_id */ "A"](this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set file_id(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_texture_file_id */ "bb"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get width() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_texture_width */ "C"](this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set width(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_texture_width */ "db"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get height() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_get_texture_height */ "B"](this.ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set height(arg0) {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_set_texture_height */ "cb"](this.ptr, arg0);
    }
}
/**
*/
class TorusSegment {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_torussegment_free */ "hb"](ptr);
    }
}
/**
*/
class Trapezium {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_trapezium_free */ "ib"](ptr);
    }
}
/**
*/
class TriangleMesh {

    static __wrap(ptr) {
        const obj = Object.create(TriangleMesh.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbg_trianglemesh_free */ "jb"](ptr);
    }
    /**
    * @returns {Float32Array}
    */
    tree_index() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* instancedmesh_tree_index */ "xb"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float64Array}
    */
    file_id() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* trianglemesh_file_id */ "qc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float32Array}
    */
    size() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* trianglemesh_size */ "rc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Float64Array}
    */
    triangle_count() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* trianglemesh_triangle_count */ "sc"](this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    color() {
        var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* trianglemesh_color */ "pc"](this.ptr);
        return takeObject(ret);
    }
}

const __wbg_parsererror_new = function(arg0) {
    var ret = ParserError.__wrap(arg0);
    return addHeapObject(ret);
};

const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

const __wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

const __wbindgen_object_clone_ref = function(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

const __wbg_new_59cb74e423758ede = function() {
    var ret = new Error();
    return addHeapObject(ret);
};

const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    var ret = getObject(arg1).stack;
    var ptr0 = passStringToWasm0(ret, _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_malloc */ "lb"], _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_realloc */ "mb"]);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    try {
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* __wbindgen_free */ "kb"](arg0, arg1);
    }
};

const __wbg_attribute_new = function(arg0) {
    var ret = Attribute.__wrap(arg0);
    return addHeapObject(ret);
};

const __wbindgen_number_new = function(arg0) {
    var ret = arg0;
    return addHeapObject(ret);
};

const __wbg_new_6b6f346b4912cdae = function() {
    var ret = new Array();
    return addHeapObject(ret);
};

const __wbg_push_f353108e20ec67a0 = function(arg0, arg1) {
    var ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

const __wbg_new_d333a6e567133fdb = function(arg0, arg1) {
    var ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

const __wbg_new_4d63b46bdff6e16c = function() {
    var ret = new Map();
    return addHeapObject(ret);
};

const __wbg_set_dfa2f1a42cb24532 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

const __wbg_buffer_44855aefa83ea48c = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

const __wbg_newwithbyteoffsetandlength_0da86dad4d55fbae = function(arg0, arg1, arg2) {
    var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

const __wbg_new_04793d2c09ba060f = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

const __wbg_newwithbyteoffsetandlength_b86dda8c37255ca3 = function(arg0, arg1, arg2) {
    var ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

const __wbg_new_a0b63d55f22daf72 = function(arg0) {
    var ret = new Uint32Array(getObject(arg0));
    return addHeapObject(ret);
};

const __wbg_newwithbyteoffsetandlength_c9f84d09508543c6 = function(arg0, arg1, arg2) {
    var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

const __wbg_new_05020d898fee9291 = function(arg0) {
    var ret = new Float32Array(getObject(arg0));
    return addHeapObject(ret);
};

const __wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8 = function(arg0, arg1, arg2) {
    var ret = new Float64Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

const __wbg_new_ed94ebb0ae0424e3 = function(arg0) {
    var ret = new Float64Array(getObject(arg0));
    return addHeapObject(ret);
};

const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

const __wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

const __wbindgen_memory = function() {
    var ret = _index_bg_wasm__WEBPACK_IMPORTED_MODULE_0__[/* memory */ "Ab"];
    return addHeapObject(ret);
};


/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ }),

/***/ "./pkg/index_bg.wasm":
/*!***************************!*\
  !*** ./pkg/index_bg.wasm ***!
  \***************************/
/*! exports provided: memory, __wbg_parsererror_free, __wbg_ctmresult_free, ctmresult_indices, ctmresult_vertices, ctmresult_normals, parse_ctm, parse_and_convert_sector, __wbg_simplesectordata_free, simplesectordata_faces, simplesectordata_node_id_to_tree_index_map, simplesectordata_tree_index_to_node_id_map, parse_and_convert_f3df, test, __wbg_texture_free, __wbg_get_texture_file_id, __wbg_set_texture_file_id, __wbg_get_texture_width, __wbg_set_texture_width, __wbg_get_texture_height, __wbg_set_texture_height, __wbg_scene_free, scene_sector_id, scene_sector_parent_id, scene_sector_bbox_min, scene_sector_bbox_max, scene_sector, __wbg_sector_free, __wbg_get_sector_id, __wbg_set_sector_id, __wbg_get_sector_parent_id, __wbg_set_sector_parent_id, __wbg_attribute_free, __wbg_get_attribute_size, __wbg_set_attribute_size, __wbg_get_attribute_offset, __wbg_set_attribute_offset, __wbg_get_scenestatistics_collections, __wbg_set_scenestatistics_collections, __wbg_trianglemesh_free, trianglemesh_file_id, trianglemesh_size, trianglemesh_triangle_count, trianglemesh_color, __wbg_instancedmesh_free, instancedmesh_tree_index, instancedmesh_size, instancedmesh_file_id, instancedmesh_triangle_count, instancedmesh_triangle_offset, instancedmesh_color, instancedmesh_translation, instancedmesh_rotation, instancedmesh_scale, instancedmesh_instance_matrix, __wbg_box3d_free, __wbg_cone_free, __wbg_circle_free, __wbg_eccentriccone_free, __wbg_ellipsoidsegment_free, __wbg_generalring_free, __wbg_generalcylinder_free, __wbg_sphericalsegment_free, __wbg_trapezium_free, __wbg_collectionstatistics_free, __wbg_get_collectionstatistics_cone_collection, __wbg_set_collectionstatistics_cone_collection, __wbg_get_collectionstatistics_circle_collection, __wbg_set_collectionstatistics_circle_collection, __wbg_get_collectionstatistics_eccentric_cone_collection, __wbg_set_collectionstatistics_eccentric_cone_collection, __wbg_get_collectionstatistics_ellipsoid_segment_collection, __wbg_set_collectionstatistics_ellipsoid_segment_collection, __wbg_get_collectionstatistics_general_ring_collection, __wbg_set_collectionstatistics_general_ring_collection, __wbg_get_collectionstatistics_general_cylinder_collection, __wbg_set_collectionstatistics_general_cylinder_collection, __wbg_get_collectionstatistics_nut_collection, __wbg_set_collectionstatistics_nut_collection, __wbg_get_collectionstatistics_quad_collection, __wbg_set_collectionstatistics_quad_collection, __wbg_get_collectionstatistics_spherical_segment_collection, __wbg_set_collectionstatistics_spherical_segment_collection, __wbg_get_collectionstatistics_torus_segment_collection, __wbg_set_collectionstatistics_torus_segment_collection, __wbg_get_collectionstatistics_trapezium_collection, __wbg_set_collectionstatistics_trapezium_collection, scene_statistics, sector_box_collection, sector_cone_collection, sector_circle_collection, sector_eccentric_cone_collection, sector_ellipsoid_segment_collection, sector_general_ring_collection, sector_general_cylinder_collection, sector_nut_collection, sector_quad_collection, sector_spherical_segment_collection, sector_torus_segment_collection, sector_trapezium_collection, sector_box_attributes, sector_cone_attributes, sector_circle_attributes, sector_eccentric_cone_attributes, sector_ellipsoid_segment_attributes, sector_general_ring_attributes, sector_general_cylinder_attributes, sector_spherical_segment_attributes, sector_torus_segment_attributes, sector_trapezium_attributes, sector_triangle_mesh_collection, sector_instanced_mesh_collection, sector_tree_index_to_node_id_map, sector_node_id_to_tree_index_map, sector_statistics, __wbg_sectorstatistics_free, __wbg_scenestatistics_free, __wbg_nut_free, __wbg_quad_free, __wbg_torussegment_free, __wbg_get_scene_root_sector_id, __wbg_get_sectorstatistics_id, __wbg_get_scenestatistics_sectors, __wbg_get_collectionstatistics_box_collection, scene_sector_count, __wbg_set_scene_root_sector_id, __wbg_set_sectorstatistics_id, __wbg_set_scenestatistics_sectors, __wbg_set_collectionstatistics_box_collection, __wbg_get_sectorstatistics_collections, trianglemesh_tree_index, __wbg_set_sectorstatistics_collections, sector_nut_attributes, sector_quad_attributes, __wbindgen_malloc, __wbindgen_free, __wbindgen_realloc */
/*! exports used: __wbg_attribute_free, __wbg_box3d_free, __wbg_circle_free, __wbg_collectionstatistics_free, __wbg_cone_free, __wbg_ctmresult_free, __wbg_eccentriccone_free, __wbg_ellipsoidsegment_free, __wbg_generalcylinder_free, __wbg_generalring_free, __wbg_get_attribute_offset, __wbg_get_attribute_size, __wbg_get_collectionstatistics_circle_collection, __wbg_get_collectionstatistics_cone_collection, __wbg_get_collectionstatistics_eccentric_cone_collection, __wbg_get_collectionstatistics_ellipsoid_segment_collection, __wbg_get_collectionstatistics_general_cylinder_collection, __wbg_get_collectionstatistics_general_ring_collection, __wbg_get_collectionstatistics_nut_collection, __wbg_get_collectionstatistics_quad_collection, __wbg_get_collectionstatistics_spherical_segment_collection, __wbg_get_collectionstatistics_torus_segment_collection, __wbg_get_collectionstatistics_trapezium_collection, __wbg_get_scenestatistics_collections, __wbg_get_sector_id, __wbg_get_sector_parent_id, __wbg_get_texture_file_id, __wbg_get_texture_height, __wbg_get_texture_width, __wbg_instancedmesh_free, __wbg_nut_free, __wbg_parsererror_free, __wbg_quad_free, __wbg_scene_free, __wbg_scenestatistics_free, __wbg_sector_free, __wbg_sectorstatistics_free, __wbg_set_attribute_offset, __wbg_set_attribute_size, __wbg_set_collectionstatistics_circle_collection, __wbg_set_collectionstatistics_cone_collection, __wbg_set_collectionstatistics_eccentric_cone_collection, __wbg_set_collectionstatistics_ellipsoid_segment_collection, __wbg_set_collectionstatistics_general_cylinder_collection, __wbg_set_collectionstatistics_general_ring_collection, __wbg_set_collectionstatistics_nut_collection, __wbg_set_collectionstatistics_quad_collection, __wbg_set_collectionstatistics_spherical_segment_collection, __wbg_set_collectionstatistics_torus_segment_collection, __wbg_set_collectionstatistics_trapezium_collection, __wbg_set_scenestatistics_collections, __wbg_set_sector_id, __wbg_set_sector_parent_id, __wbg_set_texture_file_id, __wbg_set_texture_height, __wbg_set_texture_width, __wbg_simplesectordata_free, __wbg_sphericalsegment_free, __wbg_texture_free, __wbg_torussegment_free, __wbg_trapezium_free, __wbg_trianglemesh_free, __wbindgen_free, __wbindgen_malloc, __wbindgen_realloc, ctmresult_indices, ctmresult_normals, ctmresult_vertices, instancedmesh_color, instancedmesh_file_id, instancedmesh_instance_matrix, instancedmesh_rotation, instancedmesh_scale, instancedmesh_size, instancedmesh_translation, instancedmesh_tree_index, instancedmesh_triangle_count, instancedmesh_triangle_offset, memory, parse_and_convert_f3df, parse_and_convert_sector, parse_ctm, scene_sector, scene_sector_bbox_max, scene_sector_bbox_min, scene_sector_id, scene_sector_parent_id, scene_statistics, sector_box_attributes, sector_box_collection, sector_circle_attributes, sector_circle_collection, sector_cone_attributes, sector_cone_collection, sector_eccentric_cone_attributes, sector_eccentric_cone_collection, sector_ellipsoid_segment_attributes, sector_ellipsoid_segment_collection, sector_general_cylinder_attributes, sector_general_cylinder_collection, sector_general_ring_attributes, sector_general_ring_collection, sector_instanced_mesh_collection, sector_node_id_to_tree_index_map, sector_nut_collection, sector_quad_collection, sector_spherical_segment_attributes, sector_spherical_segment_collection, sector_statistics, sector_torus_segment_attributes, sector_torus_segment_collection, sector_trapezium_attributes, sector_trapezium_collection, sector_tree_index_to_node_id_map, sector_triangle_mesh_collection, simplesectordata_faces, simplesectordata_node_id_to_tree_index_map, simplesectordata_tree_index_to_node_id_map, test, trianglemesh_color, trianglemesh_file_id, trianglemesh_size, trianglemesh_triangle_count */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Instantiate WebAssembly module
var wasmExports = __webpack_require__.w[module.i];

// export exports from WebAssembly module
module.exports = wasmExports;
// exec imports from WebAssembly module (for esm order)
/* harmony import */ var m0 = __webpack_require__(/*! ./index_bg.js */ "./pkg/index_bg.js");


// exec wasm module
wasmExports["tc"]()

/***/ })

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vaGFybW9ueS1tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vcGtnL2luZGV4LmpzIiwid2VicGFjazovLy8uL3BrZy9pbmRleF9iZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ3ZCQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBd0M7Ozs7Ozs7Ozs7Ozs7O0FDQXhDO0FBQUE7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QztBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBLGtCQUFrQixtRkFBZ0M7QUFDbEQ7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQSxrQkFBa0IsMEVBQXVCO0FBQ3pDO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBLHNDQUFzQyx5RUFBc0IsRUFBRSwwRUFBdUI7QUFDckY7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0EsS0FBSztBQUNMLFFBQVEsdUVBQW9CO0FBQzVCO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQLGNBQWMsOERBQVc7QUFDekI7QUFDQSIsImZpbGUiOiIwLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcmlnaW5hbE1vZHVsZSkge1xuXHRpZiAoIW9yaWdpbmFsTW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdHZhciBtb2R1bGUgPSBPYmplY3QuY3JlYXRlKG9yaWdpbmFsTW9kdWxlKTtcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcblx0XHRpZiAoIW1vZHVsZS5jaGlsZHJlbikgbW9kdWxlLmNoaWxkcmVuID0gW107XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJsb2FkZWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUubDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImlkXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJleHBvcnRzXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWVcblx0XHR9KTtcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcblx0fVxuXHRyZXR1cm4gbW9kdWxlO1xufTtcbiIsImltcG9ydCAqIGFzIHdhc20gZnJvbSBcIi4vaW5kZXhfYmcud2FzbVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vaW5kZXhfYmcuanNcIjsiLCJpbXBvcnQgKiBhcyB3YXNtIGZyb20gJy4vaW5kZXhfYmcud2FzbSc7XG5cbmNvbnN0IGhlYXAgPSBuZXcgQXJyYXkoMzIpLmZpbGwodW5kZWZpbmVkKTtcblxuaGVhcC5wdXNoKHVuZGVmaW5lZCwgbnVsbCwgdHJ1ZSwgZmFsc2UpO1xuXG5mdW5jdGlvbiBnZXRPYmplY3QoaWR4KSB7IHJldHVybiBoZWFwW2lkeF07IH1cblxubGV0IGhlYXBfbmV4dCA9IGhlYXAubGVuZ3RoO1xuXG5mdW5jdGlvbiBkcm9wT2JqZWN0KGlkeCkge1xuICAgIGlmIChpZHggPCAzNikgcmV0dXJuO1xuICAgIGhlYXBbaWR4XSA9IGhlYXBfbmV4dDtcbiAgICBoZWFwX25leHQgPSBpZHg7XG59XG5cbmZ1bmN0aW9uIHRha2VPYmplY3QoaWR4KSB7XG4gICAgY29uc3QgcmV0ID0gZ2V0T2JqZWN0KGlkeCk7XG4gICAgZHJvcE9iamVjdChpZHgpO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmNvbnN0IGxUZXh0RGVjb2RlciA9IHR5cGVvZiBUZXh0RGVjb2RlciA9PT0gJ3VuZGVmaW5lZCcgPyAoMCwgbW9kdWxlLnJlcXVpcmUpKCd1dGlsJykuVGV4dERlY29kZXIgOiBUZXh0RGVjb2RlcjtcblxubGV0IGNhY2hlZFRleHREZWNvZGVyID0gbmV3IGxUZXh0RGVjb2RlcigndXRmLTgnLCB7IGlnbm9yZUJPTTogdHJ1ZSwgZmF0YWw6IHRydWUgfSk7XG5cbmNhY2hlZFRleHREZWNvZGVyLmRlY29kZSgpO1xuXG5sZXQgY2FjaGVnZXRVaW50OE1lbW9yeTAgPSBudWxsO1xuZnVuY3Rpb24gZ2V0VWludDhNZW1vcnkwKCkge1xuICAgIGlmIChjYWNoZWdldFVpbnQ4TWVtb3J5MCA9PT0gbnVsbCB8fCBjYWNoZWdldFVpbnQ4TWVtb3J5MC5idWZmZXIgIT09IHdhc20ubWVtb3J5LmJ1ZmZlcikge1xuICAgICAgICBjYWNoZWdldFVpbnQ4TWVtb3J5MCA9IG5ldyBVaW50OEFycmF5KHdhc20ubWVtb3J5LmJ1ZmZlcik7XG4gICAgfVxuICAgIHJldHVybiBjYWNoZWdldFVpbnQ4TWVtb3J5MDtcbn1cblxuZnVuY3Rpb24gZ2V0U3RyaW5nRnJvbVdhc20wKHB0ciwgbGVuKSB7XG4gICAgcmV0dXJuIGNhY2hlZFRleHREZWNvZGVyLmRlY29kZShnZXRVaW50OE1lbW9yeTAoKS5zdWJhcnJheShwdHIsIHB0ciArIGxlbikpO1xufVxuXG5mdW5jdGlvbiBhZGRIZWFwT2JqZWN0KG9iaikge1xuICAgIGlmIChoZWFwX25leHQgPT09IGhlYXAubGVuZ3RoKSBoZWFwLnB1c2goaGVhcC5sZW5ndGggKyAxKTtcbiAgICBjb25zdCBpZHggPSBoZWFwX25leHQ7XG4gICAgaGVhcF9uZXh0ID0gaGVhcFtpZHhdO1xuXG4gICAgaGVhcFtpZHhdID0gb2JqO1xuICAgIHJldHVybiBpZHg7XG59XG5cbmxldCBXQVNNX1ZFQ1RPUl9MRU4gPSAwO1xuXG5mdW5jdGlvbiBwYXNzQXJyYXk4VG9XYXNtMChhcmcsIG1hbGxvYykge1xuICAgIGNvbnN0IHB0ciA9IG1hbGxvYyhhcmcubGVuZ3RoICogMSk7XG4gICAgZ2V0VWludDhNZW1vcnkwKCkuc2V0KGFyZywgcHRyIC8gMSk7XG4gICAgV0FTTV9WRUNUT1JfTEVOID0gYXJnLmxlbmd0aDtcbiAgICByZXR1cm4gcHRyO1xufVxuLyoqXG4qIEBwYXJhbSB7VWludDhBcnJheX0gaW5wdXRcbiogQHJldHVybnMge0N0bVJlc3VsdH1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VfY3RtKGlucHV0KSB7XG4gICAgdmFyIHB0cjAgPSBwYXNzQXJyYXk4VG9XYXNtMChpbnB1dCwgd2FzbS5fX3diaW5kZ2VuX21hbGxvYyk7XG4gICAgdmFyIGxlbjAgPSBXQVNNX1ZFQ1RPUl9MRU47XG4gICAgdmFyIHJldCA9IHdhc20ucGFyc2VfY3RtKHB0cjAsIGxlbjApO1xuICAgIHJldHVybiBDdG1SZXN1bHQuX193cmFwKHJldCk7XG59XG5cbi8qKlxuKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGlucHV0XG4qIEByZXR1cm5zIHtTZWN0b3J9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlX2FuZF9jb252ZXJ0X3NlY3RvcihpbnB1dCkge1xuICAgIHZhciBwdHIwID0gcGFzc0FycmF5OFRvV2FzbTAoaW5wdXQsIHdhc20uX193YmluZGdlbl9tYWxsb2MpO1xuICAgIHZhciBsZW4wID0gV0FTTV9WRUNUT1JfTEVOO1xuICAgIHZhciByZXQgPSB3YXNtLnBhcnNlX2FuZF9jb252ZXJ0X3NlY3RvcihwdHIwLCBsZW4wKTtcbiAgICByZXR1cm4gU2VjdG9yLl9fd3JhcChyZXQpO1xufVxuXG4vKipcbiogQHBhcmFtIHtVaW50OEFycmF5fSBpbnB1dFxuKiBAcmV0dXJucyB7U2ltcGxlU2VjdG9yRGF0YX1cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VfYW5kX2NvbnZlcnRfZjNkZihpbnB1dCkge1xuICAgIHZhciBwdHIwID0gcGFzc0FycmF5OFRvV2FzbTAoaW5wdXQsIHdhc20uX193YmluZGdlbl9tYWxsb2MpO1xuICAgIHZhciBsZW4wID0gV0FTTV9WRUNUT1JfTEVOO1xuICAgIHZhciByZXQgPSB3YXNtLnBhcnNlX2FuZF9jb252ZXJ0X2YzZGYocHRyMCwgbGVuMCk7XG4gICAgcmV0dXJuIFNpbXBsZVNlY3RvckRhdGEuX193cmFwKHJldCk7XG59XG5cbmxldCBjYWNoZWdldEludDMyTWVtb3J5MCA9IG51bGw7XG5mdW5jdGlvbiBnZXRJbnQzMk1lbW9yeTAoKSB7XG4gICAgaWYgKGNhY2hlZ2V0SW50MzJNZW1vcnkwID09PSBudWxsIHx8IGNhY2hlZ2V0SW50MzJNZW1vcnkwLmJ1ZmZlciAhPT0gd2FzbS5tZW1vcnkuYnVmZmVyKSB7XG4gICAgICAgIGNhY2hlZ2V0SW50MzJNZW1vcnkwID0gbmV3IEludDMyQXJyYXkod2FzbS5tZW1vcnkuYnVmZmVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlZ2V0SW50MzJNZW1vcnkwO1xufVxuLyoqXG4qIEByZXR1cm5zIHtzdHJpbmd9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHRlc3QoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgd2FzbS50ZXN0KDgpO1xuICAgICAgICB2YXIgcjAgPSBnZXRJbnQzMk1lbW9yeTAoKVs4IC8gNCArIDBdO1xuICAgICAgICB2YXIgcjEgPSBnZXRJbnQzMk1lbW9yeTAoKVs4IC8gNCArIDFdO1xuICAgICAgICByZXR1cm4gZ2V0U3RyaW5nRnJvbVdhc20wKHIwLCByMSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgd2FzbS5fX3diaW5kZ2VuX2ZyZWUocjAsIHIxKTtcbiAgICB9XG59XG5cbmNvbnN0IGxUZXh0RW5jb2RlciA9IHR5cGVvZiBUZXh0RW5jb2RlciA9PT0gJ3VuZGVmaW5lZCcgPyAoMCwgbW9kdWxlLnJlcXVpcmUpKCd1dGlsJykuVGV4dEVuY29kZXIgOiBUZXh0RW5jb2RlcjtcblxubGV0IGNhY2hlZFRleHRFbmNvZGVyID0gbmV3IGxUZXh0RW5jb2RlcigndXRmLTgnKTtcblxuY29uc3QgZW5jb2RlU3RyaW5nID0gKHR5cGVvZiBjYWNoZWRUZXh0RW5jb2Rlci5lbmNvZGVJbnRvID09PSAnZnVuY3Rpb24nXG4gICAgPyBmdW5jdGlvbiAoYXJnLCB2aWV3KSB7XG4gICAgcmV0dXJuIGNhY2hlZFRleHRFbmNvZGVyLmVuY29kZUludG8oYXJnLCB2aWV3KTtcbn1cbiAgICA6IGZ1bmN0aW9uIChhcmcsIHZpZXcpIHtcbiAgICBjb25zdCBidWYgPSBjYWNoZWRUZXh0RW5jb2Rlci5lbmNvZGUoYXJnKTtcbiAgICB2aWV3LnNldChidWYpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlYWQ6IGFyZy5sZW5ndGgsXG4gICAgICAgIHdyaXR0ZW46IGJ1Zi5sZW5ndGhcbiAgICB9O1xufSk7XG5cbmZ1bmN0aW9uIHBhc3NTdHJpbmdUb1dhc20wKGFyZywgbWFsbG9jLCByZWFsbG9jKSB7XG5cbiAgICBpZiAocmVhbGxvYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IGNhY2hlZFRleHRFbmNvZGVyLmVuY29kZShhcmcpO1xuICAgICAgICBjb25zdCBwdHIgPSBtYWxsb2MoYnVmLmxlbmd0aCk7XG4gICAgICAgIGdldFVpbnQ4TWVtb3J5MCgpLnN1YmFycmF5KHB0ciwgcHRyICsgYnVmLmxlbmd0aCkuc2V0KGJ1Zik7XG4gICAgICAgIFdBU01fVkVDVE9SX0xFTiA9IGJ1Zi5sZW5ndGg7XG4gICAgICAgIHJldHVybiBwdHI7XG4gICAgfVxuXG4gICAgbGV0IGxlbiA9IGFyZy5sZW5ndGg7XG4gICAgbGV0IHB0ciA9IG1hbGxvYyhsZW4pO1xuXG4gICAgY29uc3QgbWVtID0gZ2V0VWludDhNZW1vcnkwKCk7XG5cbiAgICBsZXQgb2Zmc2V0ID0gMDtcblxuICAgIGZvciAoOyBvZmZzZXQgPCBsZW47IG9mZnNldCsrKSB7XG4gICAgICAgIGNvbnN0IGNvZGUgPSBhcmcuY2hhckNvZGVBdChvZmZzZXQpO1xuICAgICAgICBpZiAoY29kZSA+IDB4N0YpIGJyZWFrO1xuICAgICAgICBtZW1bcHRyICsgb2Zmc2V0XSA9IGNvZGU7XG4gICAgfVxuXG4gICAgaWYgKG9mZnNldCAhPT0gbGVuKSB7XG4gICAgICAgIGlmIChvZmZzZXQgIT09IDApIHtcbiAgICAgICAgICAgIGFyZyA9IGFyZy5zbGljZShvZmZzZXQpO1xuICAgICAgICB9XG4gICAgICAgIHB0ciA9IHJlYWxsb2MocHRyLCBsZW4sIGxlbiA9IG9mZnNldCArIGFyZy5sZW5ndGggKiAzKTtcbiAgICAgICAgY29uc3QgdmlldyA9IGdldFVpbnQ4TWVtb3J5MCgpLnN1YmFycmF5KHB0ciArIG9mZnNldCwgcHRyICsgbGVuKTtcbiAgICAgICAgY29uc3QgcmV0ID0gZW5jb2RlU3RyaW5nKGFyZywgdmlldyk7XG5cbiAgICAgICAgb2Zmc2V0ICs9IHJldC53cml0dGVuO1xuICAgIH1cblxuICAgIFdBU01fVkVDVE9SX0xFTiA9IG9mZnNldDtcbiAgICByZXR1cm4gcHRyO1xufVxuXG5mdW5jdGlvbiBpc0xpa2VOb25lKHgpIHtcbiAgICByZXR1cm4geCA9PT0gdW5kZWZpbmVkIHx8IHggPT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIF9hc3NlcnRDbGFzcyhpbnN0YW5jZSwga2xhc3MpIHtcbiAgICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIGtsYXNzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGV4cGVjdGVkIGluc3RhbmNlIG9mICR7a2xhc3MubmFtZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlLnB0cjtcbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBBdHRyaWJ1dGUge1xuXG4gICAgc3RhdGljIF9fd3JhcChwdHIpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShBdHRyaWJ1dGUucHJvdG90eXBlKTtcbiAgICAgICAgb2JqLnB0ciA9IHB0cjtcblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19hdHRyaWJ1dGVfZnJlZShwdHIpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgc2l6ZSgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2F0dHJpYnV0ZV9zaXplKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IHNpemUoYXJnMCkge1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9hdHRyaWJ1dGVfc2l6ZSh0aGlzLnB0ciwgYXJnMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIGdldCBvZmZzZXQoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLl9fd2JnX2dldF9hdHRyaWJ1dGVfb2Zmc2V0KHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IG9mZnNldChhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2F0dHJpYnV0ZV9vZmZzZXQodGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBCb3gzRCB7XG5cbiAgICBmcmVlKCkge1xuICAgICAgICBjb25zdCBwdHIgPSB0aGlzLnB0cjtcbiAgICAgICAgdGhpcy5wdHIgPSAwO1xuXG4gICAgICAgIHdhc20uX193YmdfYm94M2RfZnJlZShwdHIpO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBDaXJjbGUge1xuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX2NpcmNsZV9mcmVlKHB0cik7XG4gICAgfVxufVxuLyoqXG4qL1xuZXhwb3J0IGNsYXNzIENvbGxlY3Rpb25TdGF0aXN0aWNzIHtcblxuICAgIHN0YXRpYyBfX3dyYXAocHRyKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoQ29sbGVjdGlvblN0YXRpc3RpY3MucHJvdG90eXBlKTtcbiAgICAgICAgb2JqLnB0ciA9IHB0cjtcblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19jb2xsZWN0aW9uc3RhdGlzdGljc19mcmVlKHB0cik7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIGdldCBib3hfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2F0dHJpYnV0ZV9zaXplKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IGJveF9jb2xsZWN0aW9uKGFyZzApIHtcbiAgICAgICAgd2FzbS5fX3diZ19zZXRfYXR0cmlidXRlX3NpemUodGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgY29uZV9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5fX3diZ19nZXRfY29sbGVjdGlvbnN0YXRpc3RpY3NfY29uZV9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IGNvbmVfY29sbGVjdGlvbihhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2NvbmVfY29sbGVjdGlvbih0aGlzLnB0ciwgYXJnMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIGdldCBjaXJjbGVfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2NpcmNsZV9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IGNpcmNsZV9jb2xsZWN0aW9uKGFyZzApIHtcbiAgICAgICAgd2FzbS5fX3diZ19zZXRfY29sbGVjdGlvbnN0YXRpc3RpY3NfY2lyY2xlX2NvbGxlY3Rpb24odGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgZWNjZW50cmljX2NvbmVfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2VjY2VudHJpY19jb25lX2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0ID4+PiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhcmcwXG4gICAgKi9cbiAgICBzZXQgZWNjZW50cmljX2NvbmVfY29sbGVjdGlvbihhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2VjY2VudHJpY19jb25lX2NvbGxlY3Rpb24odGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgZWxsaXBzb2lkX3NlZ21lbnRfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2VsbGlwc29pZF9zZWdtZW50X2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0ID4+PiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhcmcwXG4gICAgKi9cbiAgICBzZXQgZWxsaXBzb2lkX3NlZ21lbnRfY29sbGVjdGlvbihhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2VsbGlwc29pZF9zZWdtZW50X2NvbGxlY3Rpb24odGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgZ2VuZXJhbF9yaW5nX2NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLl9fd2JnX2dldF9jb2xsZWN0aW9uc3RhdGlzdGljc19nZW5lcmFsX3JpbmdfY29sbGVjdGlvbih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQgPj4+IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCBnZW5lcmFsX3JpbmdfY29sbGVjdGlvbihhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2dlbmVyYWxfcmluZ19jb2xsZWN0aW9uKHRoaXMucHRyLCBhcmcwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICovXG4gICAgZ2V0IGdlbmVyYWxfY3lsaW5kZXJfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2dlbmVyYWxfY3lsaW5kZXJfY29sbGVjdGlvbih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQgPj4+IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCBnZW5lcmFsX2N5bGluZGVyX2NvbGxlY3Rpb24oYXJnMCkge1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9jb2xsZWN0aW9uc3RhdGlzdGljc19nZW5lcmFsX2N5bGluZGVyX2NvbGxlY3Rpb24odGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgbnV0X2NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLl9fd2JnX2dldF9jb2xsZWN0aW9uc3RhdGlzdGljc19udXRfY29sbGVjdGlvbih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQgPj4+IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCBudXRfY29sbGVjdGlvbihhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX251dF9jb2xsZWN0aW9uKHRoaXMucHRyLCBhcmcwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICovXG4gICAgZ2V0IHF1YWRfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX3F1YWRfY29sbGVjdGlvbih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQgPj4+IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCBxdWFkX2NvbGxlY3Rpb24oYXJnMCkge1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9jb2xsZWN0aW9uc3RhdGlzdGljc19xdWFkX2NvbGxlY3Rpb24odGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgc3BoZXJpY2FsX3NlZ21lbnRfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX3NwaGVyaWNhbF9zZWdtZW50X2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0ID4+PiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhcmcwXG4gICAgKi9cbiAgICBzZXQgc3BoZXJpY2FsX3NlZ21lbnRfY29sbGVjdGlvbihhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX3NwaGVyaWNhbF9zZWdtZW50X2NvbGxlY3Rpb24odGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgdG9ydXNfc2VnbWVudF9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5fX3diZ19nZXRfY29sbGVjdGlvbnN0YXRpc3RpY3NfdG9ydXNfc2VnbWVudF9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IHRvcnVzX3NlZ21lbnRfY29sbGVjdGlvbihhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX3RvcnVzX3NlZ21lbnRfY29sbGVjdGlvbih0aGlzLnB0ciwgYXJnMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIGdldCB0cmFwZXppdW1fY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX3RyYXBleml1bV9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gYXJnMFxuICAgICovXG4gICAgc2V0IHRyYXBleml1bV9jb2xsZWN0aW9uKGFyZzApIHtcbiAgICAgICAgd2FzbS5fX3diZ19zZXRfY29sbGVjdGlvbnN0YXRpc3RpY3NfdHJhcGV6aXVtX2NvbGxlY3Rpb24odGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBDb25lIHtcblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19jb25lX2ZyZWUocHRyKTtcbiAgICB9XG59XG4vKipcbiovXG5leHBvcnQgY2xhc3MgQ3RtUmVzdWx0IHtcblxuICAgIHN0YXRpYyBfX3dyYXAocHRyKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoQ3RtUmVzdWx0LnByb3RvdHlwZSk7XG4gICAgICAgIG9iai5wdHIgPSBwdHI7XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmcmVlKCkge1xuICAgICAgICBjb25zdCBwdHIgPSB0aGlzLnB0cjtcbiAgICAgICAgdGhpcy5wdHIgPSAwO1xuXG4gICAgICAgIHdhc20uX193YmdfY3RtcmVzdWx0X2ZyZWUocHRyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7VWludDMyQXJyYXl9XG4gICAgKi9cbiAgICBpbmRpY2VzKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5jdG1yZXN1bHRfaW5kaWNlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge0Zsb2F0MzJBcnJheX1cbiAgICAqL1xuICAgIHZlcnRpY2VzKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5jdG1yZXN1bHRfdmVydGljZXModGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDMyQXJyYXkgfCB1bmRlZmluZWR9XG4gICAgKi9cbiAgICBub3JtYWxzKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5jdG1yZXN1bHRfbm9ybWFscyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxufVxuLyoqXG4qL1xuZXhwb3J0IGNsYXNzIEVjY2VudHJpY0NvbmUge1xuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX2VjY2VudHJpY2NvbmVfZnJlZShwdHIpO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBFbGxpcHNvaWRTZWdtZW50IHtcblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19lbGxpcHNvaWRzZWdtZW50X2ZyZWUocHRyKTtcbiAgICB9XG59XG4vKipcbiovXG5leHBvcnQgY2xhc3MgR2VuZXJhbEN5bGluZGVyIHtcblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19nZW5lcmFsY3lsaW5kZXJfZnJlZShwdHIpO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBHZW5lcmFsUmluZyB7XG5cbiAgICBmcmVlKCkge1xuICAgICAgICBjb25zdCBwdHIgPSB0aGlzLnB0cjtcbiAgICAgICAgdGhpcy5wdHIgPSAwO1xuXG4gICAgICAgIHdhc20uX193YmdfZ2VuZXJhbHJpbmdfZnJlZShwdHIpO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBJbnN0YW5jZWRNZXNoIHtcblxuICAgIHN0YXRpYyBfX3dyYXAocHRyKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoSW5zdGFuY2VkTWVzaC5wcm90b3R5cGUpO1xuICAgICAgICBvYmoucHRyID0gcHRyO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX2luc3RhbmNlZG1lc2hfZnJlZShwdHIpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDMyQXJyYXl9XG4gICAgKi9cbiAgICB0cmVlX2luZGV4KCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5pbnN0YW5jZWRtZXNoX3RyZWVfaW5kZXgodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDMyQXJyYXl9XG4gICAgKi9cbiAgICBzaXplKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5pbnN0YW5jZWRtZXNoX3NpemUodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDY0QXJyYXl9XG4gICAgKi9cbiAgICBmaWxlX2lkKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5pbnN0YW5jZWRtZXNoX2ZpbGVfaWQodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDY0QXJyYXl9XG4gICAgKi9cbiAgICB0cmlhbmdsZV9jb3VudCgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uaW5zdGFuY2VkbWVzaF90cmlhbmdsZV9jb3VudCh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge0Zsb2F0NjRBcnJheX1cbiAgICAqL1xuICAgIHRyaWFuZ2xlX29mZnNldCgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uaW5zdGFuY2VkbWVzaF90cmlhbmdsZV9vZmZzZXQodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgY29sb3IoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLmluc3RhbmNlZG1lc2hfY29sb3IodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDMyQXJyYXl9XG4gICAgKi9cbiAgICB0cmFuc2xhdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uaW5zdGFuY2VkbWVzaF90cmFuc2xhdGlvbih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge0Zsb2F0MzJBcnJheX1cbiAgICAqL1xuICAgIHJvdGF0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5pbnN0YW5jZWRtZXNoX3JvdGF0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7RmxvYXQzMkFycmF5fVxuICAgICovXG4gICAgc2NhbGUoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLmluc3RhbmNlZG1lc2hfc2NhbGUodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDMyQXJyYXl9XG4gICAgKi9cbiAgICBpbnN0YW5jZV9tYXRyaXgoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLmluc3RhbmNlZG1lc2hfaW5zdGFuY2VfbWF0cml4KHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG59XG4vKipcbiovXG5leHBvcnQgY2xhc3MgTnV0IHtcblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19udXRfZnJlZShwdHIpO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBQYXJzZXJFcnJvciB7XG5cbiAgICBzdGF0aWMgX193cmFwKHB0cikge1xuICAgICAgICBjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKFBhcnNlckVycm9yLnByb3RvdHlwZSk7XG4gICAgICAgIG9iai5wdHIgPSBwdHI7XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmcmVlKCkge1xuICAgICAgICBjb25zdCBwdHIgPSB0aGlzLnB0cjtcbiAgICAgICAgdGhpcy5wdHIgPSAwO1xuXG4gICAgICAgIHdhc20uX193YmdfcGFyc2VyZXJyb3JfZnJlZShwdHIpO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBRdWFkIHtcblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19xdWFkX2ZyZWUocHRyKTtcbiAgICB9XG59XG4vKipcbiovXG5leHBvcnQgY2xhc3MgU2NlbmUge1xuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX3NjZW5lX2ZyZWUocHRyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICovXG4gICAgZ2V0IHJvb3Rfc2VjdG9yX2lkKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5fX3diZ19nZXRfYXR0cmlidXRlX3NpemUodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0ID4+PiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhcmcwXG4gICAgKi9cbiAgICBzZXQgcm9vdF9zZWN0b3JfaWQoYXJnMCkge1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9hdHRyaWJ1dGVfc2l6ZSh0aGlzLnB0ciwgYXJnMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIHNlY3Rvcl9jb3VudCgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X2NvbGxlY3Rpb25zdGF0aXN0aWNzX2VjY2VudHJpY19jb25lX2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0ID4+PiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIHNlY3Rvcl9pZChpbmRleCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zY2VuZV9zZWN0b3JfaWQodGhpcy5wdHIsIGluZGV4KTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgKi9cbiAgICBzZWN0b3JfcGFyZW50X2lkKGluZGV4KSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNjZW5lX3NlY3Rvcl9wYXJlbnRfaWQodGhpcy5wdHIsIGluZGV4KTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICAqIEByZXR1cm5zIHthbnl9XG4gICAgKi9cbiAgICBzZWN0b3JfYmJveF9taW4oaW5kZXgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2NlbmVfc2VjdG9yX2Jib3hfbWluKHRoaXMucHRyLCBpbmRleCk7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAgKiBAcmV0dXJucyB7YW55fVxuICAgICovXG4gICAgc2VjdG9yX2Jib3hfbWF4KGluZGV4KSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNjZW5lX3NlY3Rvcl9iYm94X21heCh0aGlzLnB0ciwgaW5kZXgpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgICogQHJldHVybnMge1NlY3Rvcn1cbiAgICAqL1xuICAgIHNlY3RvcihpbmRleCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zY2VuZV9zZWN0b3IodGhpcy5wdHIsIGluZGV4KTtcbiAgICAgICAgcmV0dXJuIFNlY3Rvci5fX3dyYXAocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7U2NlbmVTdGF0aXN0aWNzfVxuICAgICovXG4gICAgc3RhdGlzdGljcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2NlbmVfc3RhdGlzdGljcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiBTY2VuZVN0YXRpc3RpY3MuX193cmFwKHJldCk7XG4gICAgfVxufVxuLyoqXG4qL1xuZXhwb3J0IGNsYXNzIFNjZW5lU3RhdGlzdGljcyB7XG5cbiAgICBzdGF0aWMgX193cmFwKHB0cikge1xuICAgICAgICBjb25zdCBvYmogPSBPYmplY3QuY3JlYXRlKFNjZW5lU3RhdGlzdGljcy5wcm90b3R5cGUpO1xuICAgICAgICBvYmoucHRyID0gcHRyO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX3NjZW5lc3RhdGlzdGljc19mcmVlKHB0cik7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAqL1xuICAgIGdldCBzZWN0b3JzKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5fX3diZ19nZXRfYXR0cmlidXRlX3NpemUodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0ID4+PiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhcmcwXG4gICAgKi9cbiAgICBzZXQgc2VjdG9ycyhhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2F0dHJpYnV0ZV9zaXplKHRoaXMucHRyLCBhcmcwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7Q29sbGVjdGlvblN0YXRpc3RpY3N9XG4gICAgKi9cbiAgICBnZXQgY29sbGVjdGlvbnMoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLl9fd2JnX2dldF9zY2VuZXN0YXRpc3RpY3NfY29sbGVjdGlvbnModGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gQ29sbGVjdGlvblN0YXRpc3RpY3MuX193cmFwKHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtDb2xsZWN0aW9uU3RhdGlzdGljc30gYXJnMFxuICAgICovXG4gICAgc2V0IGNvbGxlY3Rpb25zKGFyZzApIHtcbiAgICAgICAgX2Fzc2VydENsYXNzKGFyZzAsIENvbGxlY3Rpb25TdGF0aXN0aWNzKTtcbiAgICAgICAgdmFyIHB0cjAgPSBhcmcwLnB0cjtcbiAgICAgICAgYXJnMC5wdHIgPSAwO1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9zY2VuZXN0YXRpc3RpY3NfY29sbGVjdGlvbnModGhpcy5wdHIsIHB0cjApO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBTZWN0b3Ige1xuXG4gICAgc3RhdGljIF9fd3JhcChwdHIpIHtcbiAgICAgICAgY29uc3Qgb2JqID0gT2JqZWN0LmNyZWF0ZShTZWN0b3IucHJvdG90eXBlKTtcbiAgICAgICAgb2JqLnB0ciA9IHB0cjtcblxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIGZyZWUoKSB7XG4gICAgICAgIGNvbnN0IHB0ciA9IHRoaXMucHRyO1xuICAgICAgICB0aGlzLnB0ciA9IDA7XG5cbiAgICAgICAgd2FzbS5fX3diZ19zZWN0b3JfZnJlZShwdHIpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLl9fd2JnX2dldF9zZWN0b3JfaWQodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0ID4+PiAwO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhcmcwXG4gICAgKi9cbiAgICBzZXQgaWQoYXJnMCkge1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9zZWN0b3JfaWQodGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXIgfCB1bmRlZmluZWR9XG4gICAgKi9cbiAgICBnZXQgcGFyZW50X2lkKCkge1xuICAgICAgICB3YXNtLl9fd2JnX2dldF9zZWN0b3JfcGFyZW50X2lkKDgsIHRoaXMucHRyKTtcbiAgICAgICAgdmFyIHIwID0gZ2V0SW50MzJNZW1vcnkwKClbOCAvIDQgKyAwXTtcbiAgICAgICAgdmFyIHIxID0gZ2V0SW50MzJNZW1vcnkwKClbOCAvIDQgKyAxXTtcbiAgICAgICAgcmV0dXJuIHIwID09PSAwID8gdW5kZWZpbmVkIDogcjEgPj4+IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXIgfCB1bmRlZmluZWR9IGFyZzBcbiAgICAqL1xuICAgIHNldCBwYXJlbnRfaWQoYXJnMCkge1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9zZWN0b3JfcGFyZW50X2lkKHRoaXMucHRyLCAhaXNMaWtlTm9uZShhcmcwKSwgaXNMaWtlTm9uZShhcmcwKSA/IDAgOiBhcmcwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7VWludDhBcnJheX1cbiAgICAqL1xuICAgIGJveF9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfYm94X2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgY29uZV9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfY29uZV9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7VWludDhBcnJheX1cbiAgICAqL1xuICAgIGNpcmNsZV9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfY2lyY2xlX2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgZWNjZW50cmljX2NvbmVfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX2VjY2VudHJpY19jb25lX2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgZWxsaXBzb2lkX3NlZ21lbnRfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX2VsbGlwc29pZF9zZWdtZW50X2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgZ2VuZXJhbF9yaW5nX2NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9nZW5lcmFsX3JpbmdfY29sbGVjdGlvbih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge1VpbnQ4QXJyYXl9XG4gICAgKi9cbiAgICBnZW5lcmFsX2N5bGluZGVyX2NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9nZW5lcmFsX2N5bGluZGVyX2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgbnV0X2NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9udXRfY29sbGVjdGlvbih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge1VpbnQ4QXJyYXl9XG4gICAgKi9cbiAgICBxdWFkX2NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9xdWFkX2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgc3BoZXJpY2FsX3NlZ21lbnRfY29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX3NwaGVyaWNhbF9zZWdtZW50X2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgdG9ydXNfc2VnbWVudF9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfdG9ydXNfc2VnbWVudF9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7VWludDhBcnJheX1cbiAgICAqL1xuICAgIHRyYXBleml1bV9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfdHJhcGV6aXVtX2NvbGxlY3Rpb24odGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtNYXA8YW55LCBhbnk+fVxuICAgICovXG4gICAgYm94X2F0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9ib3hfYXR0cmlidXRlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICBjb25lX2F0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9jb25lX2F0dHJpYnV0ZXModGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtNYXA8YW55LCBhbnk+fVxuICAgICovXG4gICAgY2lyY2xlX2F0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9jaXJjbGVfYXR0cmlidXRlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICBlY2NlbnRyaWNfY29uZV9hdHRyaWJ1dGVzKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfZWNjZW50cmljX2NvbmVfYXR0cmlidXRlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICBlbGxpcHNvaWRfc2VnbWVudF9hdHRyaWJ1dGVzKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfZWxsaXBzb2lkX3NlZ21lbnRfYXR0cmlidXRlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICBnZW5lcmFsX3JpbmdfYXR0cmlidXRlcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX2dlbmVyYWxfcmluZ19hdHRyaWJ1dGVzKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7TWFwPGFueSwgYW55Pn1cbiAgICAqL1xuICAgIGdlbmVyYWxfY3lsaW5kZXJfYXR0cmlidXRlcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX2dlbmVyYWxfY3lsaW5kZXJfYXR0cmlidXRlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICBudXRfYXR0cmlidXRlcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX2JveF9hdHRyaWJ1dGVzKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7TWFwPGFueSwgYW55Pn1cbiAgICAqL1xuICAgIHF1YWRfYXR0cmlidXRlcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX2JveF9hdHRyaWJ1dGVzKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7TWFwPGFueSwgYW55Pn1cbiAgICAqL1xuICAgIHNwaGVyaWNhbF9zZWdtZW50X2F0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9zcGhlcmljYWxfc2VnbWVudF9hdHRyaWJ1dGVzKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7TWFwPGFueSwgYW55Pn1cbiAgICAqL1xuICAgIHRvcnVzX3NlZ21lbnRfYXR0cmlidXRlcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX3RvcnVzX3NlZ21lbnRfYXR0cmlidXRlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICB0cmFwZXppdW1fYXR0cmlidXRlcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2VjdG9yX3RyYXBleml1bV9hdHRyaWJ1dGVzKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7VHJpYW5nbGVNZXNofVxuICAgICovXG4gICAgdHJpYW5nbGVfbWVzaF9jb2xsZWN0aW9uKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfdHJpYW5nbGVfbWVzaF9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIFRyaWFuZ2xlTWVzaC5fX3dyYXAocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7SW5zdGFuY2VkTWVzaH1cbiAgICAqL1xuICAgIGluc3RhbmNlZF9tZXNoX2NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnNlY3Rvcl9pbnN0YW5jZWRfbWVzaF9jb2xsZWN0aW9uKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIEluc3RhbmNlZE1lc2guX193cmFwKHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICB0cmVlX2luZGV4X3RvX25vZGVfaWRfbWFwKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3JfdHJlZV9pbmRleF90b19ub2RlX2lkX21hcCh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICBub2RlX2lkX3RvX3RyZWVfaW5kZXhfbWFwKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3Jfbm9kZV9pZF90b190cmVlX2luZGV4X21hcCh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge1NlY3RvclN0YXRpc3RpY3N9XG4gICAgKi9cbiAgICBzdGF0aXN0aWNzKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zZWN0b3Jfc3RhdGlzdGljcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiBTZWN0b3JTdGF0aXN0aWNzLl9fd3JhcChyZXQpO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBTZWN0b3JTdGF0aXN0aWNzIHtcblxuICAgIHN0YXRpYyBfX3dyYXAocHRyKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoU2VjdG9yU3RhdGlzdGljcy5wcm90b3R5cGUpO1xuICAgICAgICBvYmoucHRyID0gcHRyO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX3NlY3RvcnN0YXRpc3RpY3NfZnJlZShwdHIpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLl9fd2JnX2dldF9hdHRyaWJ1dGVfc2l6ZSh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQgPj4+IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCBpZChhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X2F0dHJpYnV0ZV9zaXplKHRoaXMucHRyLCBhcmcwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7Q29sbGVjdGlvblN0YXRpc3RpY3N9XG4gICAgKi9cbiAgICBnZXQgY29sbGVjdGlvbnMoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLl9fd2JnX2dldF9zY2VuZXN0YXRpc3RpY3NfY29sbGVjdGlvbnModGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gQ29sbGVjdGlvblN0YXRpc3RpY3MuX193cmFwKHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtDb2xsZWN0aW9uU3RhdGlzdGljc30gYXJnMFxuICAgICovXG4gICAgc2V0IGNvbGxlY3Rpb25zKGFyZzApIHtcbiAgICAgICAgX2Fzc2VydENsYXNzKGFyZzAsIENvbGxlY3Rpb25TdGF0aXN0aWNzKTtcbiAgICAgICAgdmFyIHB0cjAgPSBhcmcwLnB0cjtcbiAgICAgICAgYXJnMC5wdHIgPSAwO1xuICAgICAgICB3YXNtLl9fd2JnX3NldF9zY2VuZXN0YXRpc3RpY3NfY29sbGVjdGlvbnModGhpcy5wdHIsIHB0cjApO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBTaW1wbGVTZWN0b3JEYXRhIHtcblxuICAgIHN0YXRpYyBfX3dyYXAocHRyKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoU2ltcGxlU2VjdG9yRGF0YS5wcm90b3R5cGUpO1xuICAgICAgICBvYmoucHRyID0gcHRyO1xuXG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX3NpbXBsZXNlY3RvcmRhdGFfZnJlZShwdHIpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDMyQXJyYXl9XG4gICAgKi9cbiAgICBmYWNlcygpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2ltcGxlc2VjdG9yZGF0YV9mYWNlcyh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgKi9cbiAgICBub2RlX2lkX3RvX3RyZWVfaW5kZXhfbWFwKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5zaW1wbGVzZWN0b3JkYXRhX25vZGVfaWRfdG9fdHJlZV9pbmRleF9tYXAodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtNYXA8YW55LCBhbnk+fVxuICAgICovXG4gICAgdHJlZV9pbmRleF90b19ub2RlX2lkX21hcCgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uc2ltcGxlc2VjdG9yZGF0YV90cmVlX2luZGV4X3RvX25vZGVfaWRfbWFwKHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG59XG4vKipcbiovXG5leHBvcnQgY2xhc3MgU3BoZXJpY2FsU2VnbWVudCB7XG5cbiAgICBmcmVlKCkge1xuICAgICAgICBjb25zdCBwdHIgPSB0aGlzLnB0cjtcbiAgICAgICAgdGhpcy5wdHIgPSAwO1xuXG4gICAgICAgIHdhc20uX193Ymdfc3BoZXJpY2Fsc2VnbWVudF9mcmVlKHB0cik7XG4gICAgfVxufVxuLyoqXG4qL1xuZXhwb3J0IGNsYXNzIFRleHR1cmUge1xuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX3RleHR1cmVfZnJlZShwdHIpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgZmlsZV9pZCgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uX193YmdfZ2V0X3RleHR1cmVfZmlsZV9pZCh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCBmaWxlX2lkKGFyZzApIHtcbiAgICAgICAgd2FzbS5fX3diZ19zZXRfdGV4dHVyZV9maWxlX2lkKHRoaXMucHRyLCBhcmcwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICovXG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5fX3diZ19nZXRfdGV4dHVyZV93aWR0aCh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IGFyZzBcbiAgICAqL1xuICAgIHNldCB3aWR0aChhcmcwKSB7XG4gICAgICAgIHdhc20uX193Ymdfc2V0X3RleHR1cmVfd2lkdGgodGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBnZXQgaGVpZ2h0KCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS5fX3diZ19nZXRfdGV4dHVyZV9oZWlnaHQodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICAvKipcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBhcmcwXG4gICAgKi9cbiAgICBzZXQgaGVpZ2h0KGFyZzApIHtcbiAgICAgICAgd2FzbS5fX3diZ19zZXRfdGV4dHVyZV9oZWlnaHQodGhpcy5wdHIsIGFyZzApO1xuICAgIH1cbn1cbi8qKlxuKi9cbmV4cG9ydCBjbGFzcyBUb3J1c1NlZ21lbnQge1xuXG4gICAgZnJlZSgpIHtcbiAgICAgICAgY29uc3QgcHRyID0gdGhpcy5wdHI7XG4gICAgICAgIHRoaXMucHRyID0gMDtcblxuICAgICAgICB3YXNtLl9fd2JnX3RvcnVzc2VnbWVudF9mcmVlKHB0cik7XG4gICAgfVxufVxuLyoqXG4qL1xuZXhwb3J0IGNsYXNzIFRyYXBleml1bSB7XG5cbiAgICBmcmVlKCkge1xuICAgICAgICBjb25zdCBwdHIgPSB0aGlzLnB0cjtcbiAgICAgICAgdGhpcy5wdHIgPSAwO1xuXG4gICAgICAgIHdhc20uX193YmdfdHJhcGV6aXVtX2ZyZWUocHRyKTtcbiAgICB9XG59XG4vKipcbiovXG5leHBvcnQgY2xhc3MgVHJpYW5nbGVNZXNoIHtcblxuICAgIHN0YXRpYyBfX3dyYXAocHRyKSB7XG4gICAgICAgIGNvbnN0IG9iaiA9IE9iamVjdC5jcmVhdGUoVHJpYW5nbGVNZXNoLnByb3RvdHlwZSk7XG4gICAgICAgIG9iai5wdHIgPSBwdHI7XG5cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICBmcmVlKCkge1xuICAgICAgICBjb25zdCBwdHIgPSB0aGlzLnB0cjtcbiAgICAgICAgdGhpcy5wdHIgPSAwO1xuXG4gICAgICAgIHdhc20uX193YmdfdHJpYW5nbGVtZXNoX2ZyZWUocHRyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7RmxvYXQzMkFycmF5fVxuICAgICovXG4gICAgdHJlZV9pbmRleCgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20uaW5zdGFuY2VkbWVzaF90cmVlX2luZGV4KHRoaXMucHRyKTtcbiAgICAgICAgcmV0dXJuIHRha2VPYmplY3QocmV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBAcmV0dXJucyB7RmxvYXQ2NEFycmF5fVxuICAgICovXG4gICAgZmlsZV9pZCgpIHtcbiAgICAgICAgdmFyIHJldCA9IHdhc20udHJpYW5nbGVtZXNoX2ZpbGVfaWQodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtGbG9hdDMyQXJyYXl9XG4gICAgKi9cbiAgICBzaXplKCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS50cmlhbmdsZW1lc2hfc2l6ZSh0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQHJldHVybnMge0Zsb2F0NjRBcnJheX1cbiAgICAqL1xuICAgIHRyaWFuZ2xlX2NvdW50KCkge1xuICAgICAgICB2YXIgcmV0ID0gd2FzbS50cmlhbmdsZW1lc2hfdHJpYW5nbGVfY291bnQodGhpcy5wdHIpO1xuICAgICAgICByZXR1cm4gdGFrZU9iamVjdChyZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICovXG4gICAgY29sb3IoKSB7XG4gICAgICAgIHZhciByZXQgPSB3YXNtLnRyaWFuZ2xlbWVzaF9jb2xvcih0aGlzLnB0cik7XG4gICAgICAgIHJldHVybiB0YWtlT2JqZWN0KHJldCk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgX193YmdfcGFyc2VyZXJyb3JfbmV3ID0gZnVuY3Rpb24oYXJnMCkge1xuICAgIHZhciByZXQgPSBQYXJzZXJFcnJvci5fX3dyYXAoYXJnMCk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diaW5kZ2VuX29iamVjdF9kcm9wX3JlZiA9IGZ1bmN0aW9uKGFyZzApIHtcbiAgICB0YWtlT2JqZWN0KGFyZzApO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JpbmRnZW5fc3RyaW5nX25ldyA9IGZ1bmN0aW9uKGFyZzAsIGFyZzEpIHtcbiAgICB2YXIgcmV0ID0gZ2V0U3RyaW5nRnJvbVdhc20wKGFyZzAsIGFyZzEpO1xuICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG59O1xuXG5leHBvcnQgY29uc3QgX193YmluZGdlbl9vYmplY3RfY2xvbmVfcmVmID0gZnVuY3Rpb24oYXJnMCkge1xuICAgIHZhciByZXQgPSBnZXRPYmplY3QoYXJnMCk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19uZXdfNTljYjc0ZTQyMzc1OGVkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXQgPSBuZXcgRXJyb3IoKTtcbiAgICByZXR1cm4gYWRkSGVhcE9iamVjdChyZXQpO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JnX3N0YWNrXzU1OGJhNTkxN2I0NjZlZGQgPSBmdW5jdGlvbihhcmcwLCBhcmcxKSB7XG4gICAgdmFyIHJldCA9IGdldE9iamVjdChhcmcxKS5zdGFjaztcbiAgICB2YXIgcHRyMCA9IHBhc3NTdHJpbmdUb1dhc20wKHJldCwgd2FzbS5fX3diaW5kZ2VuX21hbGxvYywgd2FzbS5fX3diaW5kZ2VuX3JlYWxsb2MpO1xuICAgIHZhciBsZW4wID0gV0FTTV9WRUNUT1JfTEVOO1xuICAgIGdldEludDMyTWVtb3J5MCgpW2FyZzAgLyA0ICsgMV0gPSBsZW4wO1xuICAgIGdldEludDMyTWVtb3J5MCgpW2FyZzAgLyA0ICsgMF0gPSBwdHIwO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JnX2Vycm9yXzRiYjZjMmE5NzQwNzEyOWEgPSBmdW5jdGlvbihhcmcwLCBhcmcxKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihnZXRTdHJpbmdGcm9tV2FzbTAoYXJnMCwgYXJnMSkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uX193YmluZGdlbl9mcmVlKGFyZzAsIGFyZzEpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19hdHRyaWJ1dGVfbmV3ID0gZnVuY3Rpb24oYXJnMCkge1xuICAgIHZhciByZXQgPSBBdHRyaWJ1dGUuX193cmFwKGFyZzApO1xuICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG59O1xuXG5leHBvcnQgY29uc3QgX193YmluZGdlbl9udW1iZXJfbmV3ID0gZnVuY3Rpb24oYXJnMCkge1xuICAgIHZhciByZXQgPSBhcmcwO1xuICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG59O1xuXG5leHBvcnQgY29uc3QgX193YmdfbmV3XzZiNmYzNDZiNDkxMmNkYWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmV0ID0gbmV3IEFycmF5KCk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19wdXNoX2YzNTMxMDhlMjBlYzY3YTAgPSBmdW5jdGlvbihhcmcwLCBhcmcxKSB7XG4gICAgdmFyIHJldCA9IGdldE9iamVjdChhcmcwKS5wdXNoKGdldE9iamVjdChhcmcxKSk7XG4gICAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19uZXdfZDMzM2E2ZTU2NzEzM2ZkYiA9IGZ1bmN0aW9uKGFyZzAsIGFyZzEpIHtcbiAgICB2YXIgcmV0ID0gbmV3IEVycm9yKGdldFN0cmluZ0Zyb21XYXNtMChhcmcwLCBhcmcxKSk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19uZXdfNGQ2M2I0NmJkZmY2ZTE2YyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXQgPSBuZXcgTWFwKCk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19zZXRfZGZhMmYxYTQyY2IyNDUzMiA9IGZ1bmN0aW9uKGFyZzAsIGFyZzEsIGFyZzIpIHtcbiAgICB2YXIgcmV0ID0gZ2V0T2JqZWN0KGFyZzApLnNldChnZXRPYmplY3QoYXJnMSksIGdldE9iamVjdChhcmcyKSk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19idWZmZXJfNDQ4NTVhZWZhODNlYTQ4YyA9IGZ1bmN0aW9uKGFyZzApIHtcbiAgICB2YXIgcmV0ID0gZ2V0T2JqZWN0KGFyZzApLmJ1ZmZlcjtcbiAgICByZXR1cm4gYWRkSGVhcE9iamVjdChyZXQpO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JnX25ld3dpdGhieXRlb2Zmc2V0YW5kbGVuZ3RoXzBkYTg2ZGFkNGQ1NWZiYWUgPSBmdW5jdGlvbihhcmcwLCBhcmcxLCBhcmcyKSB7XG4gICAgdmFyIHJldCA9IG5ldyBVaW50OEFycmF5KGdldE9iamVjdChhcmcwKSwgYXJnMSA+Pj4gMCwgYXJnMiA+Pj4gMCk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diZ19uZXdfMDQ3OTNkMmMwOWJhMDYwZiA9IGZ1bmN0aW9uKGFyZzApIHtcbiAgICB2YXIgcmV0ID0gbmV3IFVpbnQ4QXJyYXkoZ2V0T2JqZWN0KGFyZzApKTtcbiAgICByZXR1cm4gYWRkSGVhcE9iamVjdChyZXQpO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JnX25ld3dpdGhieXRlb2Zmc2V0YW5kbGVuZ3RoX2I4NmRkYThjMzcyNTVjYTMgPSBmdW5jdGlvbihhcmcwLCBhcmcxLCBhcmcyKSB7XG4gICAgdmFyIHJldCA9IG5ldyBVaW50MzJBcnJheShnZXRPYmplY3QoYXJnMCksIGFyZzEgPj4+IDAsIGFyZzIgPj4+IDApO1xuICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG59O1xuXG5leHBvcnQgY29uc3QgX193YmdfbmV3X2EwYjYzZDU1ZjIyZGFmNzIgPSBmdW5jdGlvbihhcmcwKSB7XG4gICAgdmFyIHJldCA9IG5ldyBVaW50MzJBcnJheShnZXRPYmplY3QoYXJnMCkpO1xuICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG59O1xuXG5leHBvcnQgY29uc3QgX193YmdfbmV3d2l0aGJ5dGVvZmZzZXRhbmRsZW5ndGhfYzlmODRkMDk1MDg1NDNjNiA9IGZ1bmN0aW9uKGFyZzAsIGFyZzEsIGFyZzIpIHtcbiAgICB2YXIgcmV0ID0gbmV3IEZsb2F0MzJBcnJheShnZXRPYmplY3QoYXJnMCksIGFyZzEgPj4+IDAsIGFyZzIgPj4+IDApO1xuICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG59O1xuXG5leHBvcnQgY29uc3QgX193YmdfbmV3XzA1MDIwZDg5OGZlZTkyOTEgPSBmdW5jdGlvbihhcmcwKSB7XG4gICAgdmFyIHJldCA9IG5ldyBGbG9hdDMyQXJyYXkoZ2V0T2JqZWN0KGFyZzApKTtcbiAgICByZXR1cm4gYWRkSGVhcE9iamVjdChyZXQpO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JnX25ld3dpdGhieXRlb2Zmc2V0YW5kbGVuZ3RoX2IyYmYxOWVjNzYwNzFlZDggPSBmdW5jdGlvbihhcmcwLCBhcmcxLCBhcmcyKSB7XG4gICAgdmFyIHJldCA9IG5ldyBGbG9hdDY0QXJyYXkoZ2V0T2JqZWN0KGFyZzApLCBhcmcxID4+PiAwLCBhcmcyID4+PiAwKTtcbiAgICByZXR1cm4gYWRkSGVhcE9iamVjdChyZXQpO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JnX25ld19lZDk0ZWJiMGFlMDQyNGUzID0gZnVuY3Rpb24oYXJnMCkge1xuICAgIHZhciByZXQgPSBuZXcgRmxvYXQ2NEFycmF5KGdldE9iamVjdChhcmcwKSk7XG4gICAgcmV0dXJuIGFkZEhlYXBPYmplY3QocmV0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBfX3diaW5kZ2VuX3Rocm93ID0gZnVuY3Rpb24oYXJnMCwgYXJnMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihnZXRTdHJpbmdGcm9tV2FzbTAoYXJnMCwgYXJnMSkpO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JpbmRnZW5fcmV0aHJvdyA9IGZ1bmN0aW9uKGFyZzApIHtcbiAgICB0aHJvdyB0YWtlT2JqZWN0KGFyZzApO1xufTtcblxuZXhwb3J0IGNvbnN0IF9fd2JpbmRnZW5fbWVtb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJldCA9IHdhc20ubWVtb3J5O1xuICAgIHJldHVybiBhZGRIZWFwT2JqZWN0KHJldCk7XG59O1xuXG4iXSwic291cmNlUm9vdCI6IiJ9
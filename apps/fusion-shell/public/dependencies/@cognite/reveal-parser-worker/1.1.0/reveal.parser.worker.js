!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var r in n)("object"==typeof exports?exports:e)[r]=n[r]}}(self,(function(){return function(e){self.webpackChunk=function(t,r){for(var o in r)e[o]=r[o];for(;t.length;)n[t.pop()]=1};var t={},n={0:1},r={};var o={2:function(){return{"./reveal_rs_wrapper_bg.js":{__wbg_parsererror_new:function(e){return t[1].exports.N(e)},__wbindgen_object_drop_ref:function(e){return t[1].exports.U(e)},__wbindgen_string_new:function(e,n){return t[1].exports.W(e,n)},__wbindgen_object_clone_ref:function(e){return t[1].exports.T(e)},__wbg_new_59cb74e423758ede:function(){return t[1].exports.E()},__wbg_stack_558ba5917b466edd:function(e,n){return t[1].exports.Q(e,n)},__wbg_error_4bb6c2a97407129a:function(e,n){return t[1].exports.A(e,n)},__wbg_attribute_new:function(e){return t[1].exports.y(e)},__wbindgen_number_new:function(e){return t[1].exports.S(e)},__wbg_new_6b6f346b4912cdae:function(){return t[1].exports.F()},__wbg_push_f353108e20ec67a0:function(e,n){return t[1].exports.O(e,n)},__wbg_new_d333a6e567133fdb:function(e,n){return t[1].exports.H(e,n)},__wbg_new_4d63b46bdff6e16c:function(){return t[1].exports.D()},__wbg_set_dfa2f1a42cb24532:function(e,n,r){return t[1].exports.P(e,n,r)},__wbg_buffer_44855aefa83ea48c:function(e){return t[1].exports.z(e)},__wbg_newwithbyteoffsetandlength_0da86dad4d55fbae:function(e,n,r){return t[1].exports.J(e,n,r)},__wbg_new_04793d2c09ba060f:function(e){return t[1].exports.B(e)},__wbg_newwithbyteoffsetandlength_b86dda8c37255ca3:function(e,n,r){return t[1].exports.L(e,n,r)},__wbg_new_a0b63d55f22daf72:function(e){return t[1].exports.G(e)},__wbg_newwithbyteoffsetandlength_c9f84d09508543c6:function(e,n,r){return t[1].exports.M(e,n,r)},__wbg_new_05020d898fee9291:function(e){return t[1].exports.C(e)},__wbg_newwithbyteoffsetandlength_b2bf19ec76071ed8:function(e,n,r){return t[1].exports.K(e,n,r)},__wbg_new_ed94ebb0ae0424e3:function(e){return t[1].exports.I(e)},__wbindgen_throw:function(e,n){return t[1].exports.X(e,n)},__wbindgen_rethrow:function(e){return t[1].exports.V(e)},__wbindgen_memory:function(){return t[1].exports.R()}}}}};function s(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,s),r.l=!0,r.exports}return s.e=function(e){var t=[];return t.push(Promise.resolve().then((function(){n[e]||importScripts(s.p+""+({}[e]||e)+".js")}))),({1:[2]}[e]||[]).forEach((function(e){var n=r[e];if(n)t.push(n);else{var i,c=o[e](),a=fetch(s.p+""+{2:"05093ad5b189ca050cc4"}[e]+".module.wasm");if(c instanceof Promise&&"function"==typeof WebAssembly.compileStreaming)i=Promise.all([WebAssembly.compileStreaming(a),c]).then((function(e){return WebAssembly.instantiate(e[0],e[1])}));else if("function"==typeof WebAssembly.instantiateStreaming)i=WebAssembly.instantiateStreaming(a,c);else{i=a.then((function(e){return e.arrayBuffer()})).then((function(e){return WebAssembly.instantiate(e,c)}))}t.push(r[e]=i.then((function(t){return s.w[e]=(t.instance||t).exports})))}})),Promise.all(t)},s.m=e,s.c=t,s.d=function(e,t,n){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)s.d(n,r,function(t){return e[t]}.bind(null,r));return n},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="https://cdf-hub-bundles.cogniteapp.com/dependencies/@cognite/reveal-parser-worker/1.1.0/",s.w={},s(s.s=0)}([function(e,t,n){"use strict";function r(e){const t=new Map;for(let n=0;n<e.length;++n){const r=e[n],o=t.get(r);o?t.set(r,[...o,n]):t.set(r,[n])}return t}function o(e){if(0===e.length)return[];const t=new Array(e.length);t[0]=0;for(let n=1;n<e.length;n++)t[n]=t[n-1]+e[n-1];return t}
/*!
 * Copyright 2020 Cognite AS
 */n.r(t),n.d(t,"RevealParserWorker",(function(){return i}));const s=n.e(1).then(n.bind(null,4));class i{async parseSector(e){const t=(await s).parse_and_convert_sector(e),n=this.extractInstanceMeshes(t),r=this.extractTriangleMeshes(t),o=this.extractParsedPrimitives(t),i={treeIndexToNodeIdMap:t.tree_index_to_node_id_map(),nodeIdToTreeIndexMap:t.node_id_to_tree_index_map(),primitives:o,instanceMeshes:n,triangleMeshes:r};return t.free(),i}async parseCtm(e){const t=(await s).parse_ctm(e),n={indices:t.indices(),vertices:t.vertices(),normals:t.normals()};return t.free(),n}async parseQuads(e){const t=(await s).parse_and_convert_f3df(e),n={buffer:t.faces(),treeIndexToNodeIdMap:t.tree_index_to_node_id_map(),nodeIdToTreeIndexMap:t.node_id_to_tree_index_map()};return t.free(),n}async createDetailedGeometry(e,t){
/*!
 * Copyright 2020 Cognite AS
 */
return async function(e,t){const{instanceMeshes:n,triangleMeshes:s}=e,i=(()=>{const{fileIds:e,colors:n,triangleCounts:i,treeIndices:c}=s,a=r(e),l=[];for(const[e,r]of a.entries()){const s=r.map(e=>i[e]),a=o(s),u=`mesh_${e}.ctm`,{indices:f,vertices:_,normals:d}=t.get(u),p=new Uint8Array(3*f.length),b=new Float32Array(f.length);for(let e=0;e<r.length;e++){const t=r[e],o=c[t],i=a[e],l=s[e],[u,_,d]=[n[4*t+0],n[4*t+1],n[4*t+2]];for(let e=i;e<i+l;e++)for(let t=0;t<3;t++){const n=f[3*e+t];b[n]=o,p[3*n]=u,p[3*n+1]=_,p[3*n+2]=d}}const g={colors:p,fileId:e,treeIndices:b,indices:f,vertices:_,normals:d};l.push(g)}return l})(),c=(()=>{const{fileIds:e,colors:o,treeIndices:s,triangleCounts:i,triangleOffsets:c,instanceMatrices:a}=n,l=r(e),u=[];for(const[e,n]of l.entries()){const l=`mesh_${e}.ctm`,f=t.get(l),_=f.indices,d=f.vertices,p=f.normals,b=[],g=new Float64Array(n.map(e=>c[e])),m=new Float64Array(n.map(e=>i[e])),h=r(g);for(const[e,t]of h){const r=m[t[0]],i=new Float32Array(16*t.length),c=new Float32Array(t.length),l=new Uint8Array(4*t.length);for(let e=0;e<t.length;e++){const r=n[t[e]],u=s[r],f=a.slice(16*r,16*r+16);i.set(f,16*e),c[e]=u;const _=o.slice(4*r,4*r+4);l.set(_,4*e)}b.push({triangleCount:r,triangleOffset:e,instanceMatrices:i,colors:l,treeIndices:c})}const y={fileId:e,indices:_,vertices:d,normals:p,instances:b};u.push(y)}return u})();return{treeIndexToNodeIdMap:e.treeIndexToNodeIdMap,nodeIdToTreeIndexMap:e.nodeIdToTreeIndexMap,primitives:e.primitives,instanceMeshes:c,triangleMeshes:i}}(e,t)}extractParsedPrimitives(e){return{boxCollection:e.box_collection(),boxAttributes:this.convertToJSMemory(e.box_attributes()),circleCollection:e.circle_collection(),circleAttributes:this.convertToJSMemory(e.circle_attributes()),coneCollection:e.cone_collection(),coneAttributes:this.convertToJSMemory(e.cone_attributes()),eccentricConeCollection:e.eccentric_cone_collection(),eccentricConeAttributes:this.convertToJSMemory(e.eccentric_cone_attributes()),ellipsoidSegmentCollection:e.ellipsoid_segment_collection(),ellipsoidSegmentAttributes:this.convertToJSMemory(e.ellipsoid_segment_attributes()),generalCylinderCollection:e.general_cylinder_collection(),generalCylinderAttributes:this.convertToJSMemory(e.general_cylinder_attributes()),generalRingCollection:e.general_ring_collection(),generalRingAttributes:this.convertToJSMemory(e.general_ring_attributes()),nutCollection:e.nut_collection(),nutAttributes:this.convertToJSMemory(e.nut_attributes()),quadCollection:e.quad_collection(),quadAttributes:this.convertToJSMemory(e.quad_attributes()),sphericalSegmentCollection:e.spherical_segment_collection(),sphericalSegmentAttributes:this.convertToJSMemory(e.spherical_segment_attributes()),torusSegmentCollection:e.torus_segment_collection(),torusSegmentAttributes:this.convertToJSMemory(e.torus_segment_attributes()),trapeziumCollection:e.trapezium_collection(),trapeziumAttributes:this.convertToJSMemory(e.trapezium_attributes())}}extractTriangleMeshes(e){const t=e.triangle_mesh_collection(),n={fileIds:t.file_id().slice(),treeIndices:t.tree_index().slice(),colors:t.color().slice(),triangleCounts:t.triangle_count().slice(),sizes:t.size().slice()};return t.free(),n}extractInstanceMeshes(e){const t=e.instanced_mesh_collection(),n={fileIds:t.file_id().slice(),treeIndices:t.tree_index().slice(),colors:t.color().slice(),triangleOffsets:t.triangle_offset().slice(),triangleCounts:t.triangle_count().slice(),sizes:t.size().slice(),instanceMatrices:t.instance_matrix().slice()};return t.free(),n}convertToJSMemory(e){const t=new Map;for(const n of e.entries()){const[e,r]=n;t.set(e,{size:r.size,offset:r.offset}),r.free()}return t}}const c=Symbol("Comlink.proxy"),a=Symbol("Comlink.endpoint"),l=Symbol("Comlink.releaseProxy"),u=Symbol("Comlink.thrown"),f=e=>"object"==typeof e&&null!==e||"function"==typeof e,_=new Map([["proxy",{canHandle:e=>f(e)&&e[c],serialize(e){const{port1:t,port2:n}=new MessageChannel;return d(e,t),[n,[n]]},deserialize(e){return e.start(),function e(t,n=[],r=function(){}){let o=!1;const s=new Proxy(r,{get(r,i){if(b(o),i===l)return()=>w(t,{type:5,path:n.map(e=>e.toString())}).then(()=>{p(t),o=!0});if("then"===i){if(0===n.length)return{then:()=>s};const e=w(t,{type:0,path:n.map(e=>e.toString())}).then(y);return e.then.bind(e)}return e(t,[...n,i])},set(e,r,s){b(o);const[i,c]=h(s);return w(t,{type:1,path:[...n,r].map(e=>e.toString()),value:i},c).then(y)},apply(r,s,i){b(o);const c=n[n.length-1];if(c===a)return w(t,{type:4}).then(y);if("bind"===c)return e(t,n.slice(0,-1));const[l,u]=g(i);return w(t,{type:2,path:n.map(e=>e.toString()),argumentList:l},u).then(y)},construct(e,r){b(o);const[s,i]=g(r);return w(t,{type:3,path:n.map(e=>e.toString()),argumentList:s},i).then(y)}});return s}(e,[],t);var t}}],["throw",{canHandle:e=>f(e)&&u in e,serialize({value:e}){let t;return t=e instanceof Error?{isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:{isError:!1,value:e},[t,[]]},deserialize(e){if(e.isError)throw Object.assign(new Error(e.value.message),e.value);throw e.value}}]]);function d(e,t=self){t.addEventListener("message",(function n(r){if(!r||!r.data)return;const{id:o,type:s,path:i}=Object.assign({path:[]},r.data),a=(r.data.argumentList||[]).map(y);let l;try{const t=i.slice(0,-1).reduce((e,t)=>e[t],e),n=i.reduce((e,t)=>e[t],e);switch(s){case 0:l=n;break;case 1:t[i.slice(-1)[0]]=y(r.data.value),l=!0;break;case 2:l=n.apply(t,a);break;case 3:l=function(e){return Object.assign(e,{[c]:!0})}(new n(...a));break;case 4:{const{port1:t,port2:n}=new MessageChannel;d(e,n),l=function(e,t){return m.set(e,t),e}(t,[t])}break;case 5:l=void 0}}catch(e){l={value:e,[u]:0}}Promise.resolve(l).catch(e=>({value:e,[u]:0})).then(e=>{const[r,i]=h(e);t.postMessage(Object.assign(Object.assign({},r),{id:o}),i),5===s&&(t.removeEventListener("message",n),p(t))})})),t.start&&t.start()}function p(e){(function(e){return"MessagePort"===e.constructor.name})(e)&&e.close()}function b(e){if(e)throw new Error("Proxy has been released and is not useable")}function g(e){const t=e.map(h);return[t.map(e=>e[0]),(n=t.map(e=>e[1]),Array.prototype.concat.apply([],n))];var n}const m=new WeakMap;function h(e){for(const[t,n]of _)if(n.canHandle(e)){const[r,o]=n.serialize(e);return[{type:3,name:t,value:r},o]}return[{type:0,value:e},m.get(e)||[]]}function y(e){switch(e.type){case 3:return _.get(e.name).deserialize(e.value);case 0:return e.value}}function w(e,t,n){return new Promise(r=>{const o=new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-");e.addEventListener("message",(function t(n){n.data&&n.data.id&&n.data.id===o&&(e.removeEventListener("message",t),r(n.data))})),e.start&&e.start(),e.postMessage(Object.assign({id:o},t),n)})}d(new i)}])}));
//# sourceMappingURL=reveal.parser.worker.map
// From https://github.com/mrdoob/three.js/blob/05fc79cd52b79e8c3e8dec1e7dca72c5c39983a4/src/renderers/shaders/ShaderChunk/encodings_pars_fragment.glsl.js
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
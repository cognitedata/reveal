// From https://github.com/mrdoob/three.js/blob/05fc79cd52b79e8c3e8dec1e7dca72c5c39983a4/src/renderers/shaders/ShaderChunk/encodings_pars_fragment.glsl.js
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

// Piecewise sRGB transfer functions (IEC 61966-2-1). Use these to move a base
// color from sRGB (display) space into linear light for shading, and to encode
// a linear result back to sRGB for display.
vec3 sRGBToLinear(vec3 srgb) {
	bvec3 cutoff = lessThanEqual(srgb, vec3(0.04045));
	vec3 low = srgb / 12.92;
	vec3 high = pow((srgb + vec3(0.055)) / 1.055, vec3(2.4));
	return mix(high, low, vec3(cutoff));
}

vec3 LinearTosRGB(vec3 linearRGB) {
	bvec3 cutoff = lessThanEqual(linearRGB, vec3(0.0031308));
	vec3 low = linearRGB * 12.92;
	vec3 high = pow(linearRGB, vec3(1.0 / 2.4)) * 1.055 - vec3(0.055);
	return mix(high, low, vec3(cutoff));
}

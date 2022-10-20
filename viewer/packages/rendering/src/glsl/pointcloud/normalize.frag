precision highp float;

uniform sampler2D tDepth;
uniform sampler2D tDiffuse;

#if defined(use_edl)
	#pragma glslify: import('./edl.glsl');

	uniform float screenWidth;
	uniform float screenHeight;
	uniform vec2 neighbours[NEIGHBOUR_COUNT];
	uniform float edlStrength;
	uniform float radius;

#endif

in vec2 vUv;

out vec4 outputColor;

void main() {
    
	float depth = texture(tDepth, vUv).r;
    vec4 color = texture(tDiffuse, vUv);
	bool shouldDiscard = depth >= 1.0;

	#if defined(points_blend) 
		color = color / color.w;
	#endif

	outputColor = vec4(color.rgb, 1.0);
	gl_FragDepth = depth;

	#if defined(use_edl)
		float edlDepth = color.a;

		vec2 obs = calculateObscurance(edlDepth, screenWidth, screenHeight, 
			neighbours, radius, vUv, tDepth, tDiffuse);
		float shade = exp(-obs.x * 300.0 * edlStrength);
		
		shouldDiscard = shouldDiscard && obs.x == 0.0; 
		
		outputColor.xyz *= shade;
		gl_FragDepth = obs.y;
	#endif

	if (shouldDiscard) {
		discard;
	}
}
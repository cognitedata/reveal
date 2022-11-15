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

	#if defined(points_blend)
		uniform sampler2D tLogDepth;
	#endif
#endif

#define EDL_STRENGTH_FACTOR 300.0

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
		#if defined (points_blend)
			float edlDepth = texture(tLogDepth, vUv).a;
			vec2 obs = calculateObscurance(edlDepth, screenWidth, screenHeight,
						       neighbours, radius, vUv, tDepth, tLogDepth);
		#else
			float edlDepth = color.a;
			vec2 obs = calculateObscurance(edlDepth, screenWidth, screenHeight,
						       neighbours, radius, vUv, tDepth, tDiffuse);
		#endif

		float shade = exp(-obs.x * EDL_STRENGTH_FACTOR * edlStrength);

		shouldDiscard = shouldDiscard && obs.x == 0.0;

		outputColor.xyz *= shade;
		gl_FragDepth = obs.y;
	#endif

	if (shouldDiscard) {
		discard;
	}
}

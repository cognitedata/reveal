precision highp float;

uniform sampler2D tDepth;
uniform sampler2D tDiffuse;

#if defined(use_edl) || defined(fill_gaps)
	uniform float screenWidth;
	uniform float screenHeight;
#endif

#if defined(fill_gaps)
	uniform float cameraNear;
	uniform float cameraFar;
	uniform float worldPerPixelUnitDepth; // world units per screen pixel at eye depth 1; 0 = orthographic
#endif

#if defined(use_edl)
	#include edl.glsl;

	uniform vec2 neighbours[NEIGHBOUR_COUNT];
	uniform float edlStrength;
	uniform float radius;
#endif

#if defined(use_edl) && defined(points_blend)
	uniform sampler2D tLogDepth;
#endif

#if defined(fill_gaps)
	// View-space distance at a pixel. The point shader writes log2(viewDist)/10 into an alpha
	// channel for EDL; reusing it keeps this stable at all ranges, unlike the hardware depth
	// buffer whose precision collapses far from the camera.
	float gapFillEyeDistance(vec2 uv, float windowDepth) {
		#if defined(use_edl) && defined(points_blend)
			return exp2(texture(tLogDepth, uv).a * 10.0);
		#elif defined(use_edl)
			return exp2(texture(tDiffuse, uv).a * 10.0);
		#else
			float ndcZ = windowDepth * 2.0 - 1.0;
			return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - ndcZ * (cameraFar - cameraNear));
		#endif
	}
#endif

#define EDL_STRENGTH_FACTOR 400.0

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

	#if defined(fill_gaps)
		// Fill the gaps that open between points: an empty pixel adopts its nearest covered
		// neighbour so the surface reads as continuous without inflating point sizes.
		//
		// The search widens in strided steps (1px, 2px, 4px, ...): the tight step closes the
		// fine gaps seen from a distance, the wider steps reach across the large gaps you get
		// with the camera close.
		//
		// A step only fills if the covered neighbours it found look like ONE surface - their
		// view-space distances stay within a spread a real (even steeply grazing) surface could
		// have over that window. A sudden jump means the gap straddles a depth discontinuity
		// (a silhouette against what is behind it), so it is left alone.
		if (depth >= 1.0) {
			vec2 texel = 1.0 / vec2(screenWidth, screenHeight);
			vec2 filledUv = vUv;
			bool filled = false;

			for (int stepIndex = 0; stepIndex < FILL_GAPS_STEPS; stepIndex++) {
				int step = 1 << stepIndex;
				vec2 bestUv = vUv;
				float nearEye = 1.0e30;
				float farEye = 0.0;
				int covered = 0;
				// Coverage per side, so we only fill a pixel the surface actually surrounds.
				int coveredNegX = 0;
				int coveredPosX = 0;
				int coveredNegY = 0;
				int coveredPosY = 0;

				for (int y = -FILL_GAPS_RADIUS; y <= FILL_GAPS_RADIUS; y++) {
					for (int x = -FILL_GAPS_RADIUS; x <= FILL_GAPS_RADIUS; x++) {
						if (x == 0 && y == 0) {
							continue;
						}

						vec2 uvNeighbour = vUv + vec2(float(x * step), float(y * step)) * texel;
						float neighbourDepth = texture(tDepth, uvNeighbour).r;

						if (neighbourDepth >= 1.0) {
							continue;
						}

						float neighbourEye = gapFillEyeDistance(uvNeighbour, neighbourDepth);

						covered++;
						if (x < 0) { coveredNegX++; } else if (x > 0) { coveredPosX++; }
						if (y < 0) { coveredNegY++; } else if (y > 0) { coveredPosY++; }

						farEye = max(farEye, neighbourEye);
						if (neighbourEye < nearEye) {
							nearEye = neighbourEye;
							bestUv = uvNeighbour;
						}
					}
				}

				bool surrounded = (coveredNegX > 0 && coveredPosX > 0) || (coveredNegY > 0 && coveredPosY > 0);

				if (covered >= FILL_GAPS_MIN_COVERED && surrounded) {
					float reachPixels = float(step * FILL_GAPS_RADIUS);
					float worldWindow = max(worldPerPixelUnitDepth, 0.0) * nearEye * reachPixels;

					// 1. Camera-distance gate: only bridge a hole up to this size in the WORLD.
					//    A fixed world size projects to many pixels up close, few from far away.
					bool withinWorldGap = worldPerPixelUnitDepth <= 0.0 || worldWindow <= float(FILL_GAPS_MAX_WORLD_GAP);

					// 2. Surface check: the covered neighbours must look like one surface - depth
					//    spread within what curvature/noise plus a grazing angle could produce.
					float allowedSpread = nearEye * float(FILL_GAPS_DEPTH_TOL) + float(FILL_GAPS_GRAZE_TOL) * worldWindow;
					bool oneSurface = farEye - nearEye <= allowedSpread;

					if (withinWorldGap && oneSurface) {
						filledUv = bestUv;
						filled = true;
					}
					// Surrounded already - wider steps only reach further, so stop either way.
					break;
				}
			}

			if (filled) {
				color = texture(tDiffuse, filledUv);
				#if defined(points_blend)
					color = color / color.w;
				#endif
				depth = texture(tDepth, filledUv).r;
				shouldDiscard = false;
				outputColor = vec4(color.rgb, 1.0);
				gl_FragDepth = depth;
			}
		}
	#endif

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

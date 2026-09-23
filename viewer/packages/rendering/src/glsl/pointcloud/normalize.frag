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

	#if defined(fill_gaps) && defined(points_blend)
		// The depth pre-pass writes full opaque depth for any pixel inside a point's circular
		// footprint, even one right at the edge that the separate weighted colour pass only gave
		// a sliver of coverage to (color.w near 0). That pixel reads as "covered" (depth < 1.0)
		// while looking like an empty gap - catch it here so it goes through the same fill path.
		bool weaklyCovered = depth < 1.0 && color.w < float(FILL_GAPS_MIN_COVERAGE_WEIGHT);
	#endif

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
		#if defined(points_blend)
			bool isGap = depth >= 1.0 || weaklyCovered;
		#else
			bool isGap = depth >= 1.0;
		#endif
		if (isGap) {
			vec2 texel = 1.0 / vec2(screenWidth, screenHeight);
			vec2 filledUv = vUv;
			bool filled = false;

			for (int stepIndex = 0; stepIndex < FILL_GAPS_STEPS; stepIndex++) {
				int step = 1 << stepIndex;

				// Pass 1: find the nearest covered neighbour in this window. This anchors what
				// "same surface" means below, BEFORE we look at the rest of the window - so a
				// background surface glimpsed past a thin foreground feature (a pole against a
				// railing behind it) never gets a vote in what counts as coverage.
				vec2 bestUv = vUv;
				float nearEye = 1.0e30;
				bool anyCovered = false;

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

						anyCovered = true;
						float neighbourEye = gapFillEyeDistance(uvNeighbour, neighbourDepth);
						if (neighbourEye < nearEye) {
							nearEye = neighbourEye;
							bestUv = uvNeighbour;
						}
					}
				}

				if (!anyCovered) {
					continue;
				}

				float reachPixels = float(step * FILL_GAPS_RADIUS);
				float worldWindow = max(worldPerPixelUnitDepth, 0.0) * nearEye * reachPixels;

				// 1. Camera-distance gate: only bridge a hole up to this size in the WORLD.
				//    A fixed world size projects to many pixels up close, few from far away.
				bool withinWorldGap = worldPerPixelUnitDepth <= 0.0 || worldWindow <= float(FILL_GAPS_MAX_WORLD_GAP);

				// Spread a real (even steeply grazing) surface could have over this window -
				// used to tell the nearest surface apart from anything behind it, before
				// coverage is counted.
				float allowedSpread = nearEye * float(FILL_GAPS_DEPTH_TOL) + float(FILL_GAPS_GRAZE_TOL) * worldWindow;

				// Pass 2: coverage restricted to neighbours that read as the SAME surface as the
				// nearest one found above. Coverage per diagonal quadrant, so we only fill a
				// pixel that surface actually wraps around in 2D - a pixel just outside a thin
				// linear feature only ever has same-surface neighbours in the two quadrants on
				// the feature's side, never all four, so it is correctly rejected here.
				int covered = 0;
				int coveredPP = 0;
				int coveredPN = 0;
				int coveredNP = 0;
				int coveredNN = 0;

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
						if (neighbourEye - nearEye > allowedSpread) {
							continue; // Different surface (e.g. background behind a thin feature) - ignore.
						}

						covered++;
						if (x >= 0 && y >= 0) { coveredPP++; }
						if (x >= 0 && y <= 0) { coveredPN++; }
						if (x <= 0 && y >= 0) { coveredNP++; }
						if (x <= 0 && y <= 0) { coveredNN++; }
					}
				}

				bool surrounded = coveredPP > 0 && coveredPN > 0 && coveredNP > 0 && coveredNN > 0;

				if (withinWorldGap && covered >= FILL_GAPS_MIN_COVERED && surrounded) {
					filledUv = bestUv;
					filled = true;
					break;
				}
				// Otherwise keep widening - a tighter window can miss same-surface coverage that
				// a wider one still finds.
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

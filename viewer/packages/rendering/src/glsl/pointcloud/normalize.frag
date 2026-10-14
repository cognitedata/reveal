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
	uniform bool orthographicCamera;
	// World units per screen pixel: at one unit of eye depth for a perspective camera, constant
	// for an orthographic one. 0 disables the world-size gate (unknown camera type).
	uniform float worldPerPixel;
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

// Smallest colour weight a point-blended pixel can be normalized by without blowing up.
#define MIN_BLEND_WEIGHT 1.0e-6

#if defined(fill_gaps)
	#define FILL_GAPS_DIAMETER (2 * FILL_GAPS_RADIUS + 1)
	#define FILL_GAPS_TAPS (FILL_GAPS_DIAMETER * FILL_GAPS_DIAMETER)
	#define FILL_GAPS_EMPTY -1.0

	// The fill runs in non-uniform control flow (only gap pixels take it), where implicit
	// derivatives - and so the mip level texture() picks - are undefined. Every lookup in it
	// uses textureLod at level 0 instead.

	// View-space distance at a pixel. The point shader writes log2(viewDist)/10 into an alpha
	// channel for EDL; reusing it keeps this stable at all ranges, unlike the hardware depth
	// buffer whose precision collapses far from the camera.
	float gapFillEyeDistance(vec2 uv, float windowDepth) {
		#if defined(use_edl) && defined(points_blend)
			return exp2(textureLod(tLogDepth, uv, 0.0).a * 10.0);
		#elif defined(use_edl)
			return exp2(textureLod(tDiffuse, uv, 0.0).a * 10.0);
		#else
			if (orthographicCamera) {
				return cameraNear + windowDepth * (cameraFar - cameraNear);
			}
			float ndcZ = windowDepth * 2.0 - 1.0;
			return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - ndcZ * (cameraFar - cameraNear));
		#endif
	}

	// View-space distance of a covered neighbour, or FILL_GAPS_EMPTY if it is empty or off screen.
	// Off-screen taps would otherwise clamp to the edge texel and count it several times over.
	float gapFillNeighbourEye(vec2 uv) {
		if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
			return FILL_GAPS_EMPTY;
		}

		float neighbourDepth = textureLod(tDepth, uv, 0.0).r;
		if (neighbourDepth >= 1.0) {
			return FILL_GAPS_EMPTY;
		}

		return gapFillEyeDistance(uv, neighbourDepth);
	}
#endif

#define EDL_STRENGTH_FACTOR 400.0

in vec2 vUv;

out vec4 outputColor;

void main() {

	float depth = texture(tDepth, vUv).r;
	vec4 color = texture(tDiffuse, vUv);
	bool shouldDiscard = depth >= 1.0;
	// Pixel the output colour and EDL depth are taken from - moves to the source pixel on a gap fill.
	vec2 sourceUv = vUv;

	#if defined(fill_gaps) && defined(points_blend)
		// The depth pre-pass writes full opaque depth for any pixel inside a point's circular
		// footprint, even one right at the edge that the separate weighted colour pass only gave
		// a sliver of coverage to (color.w near 0). That pixel reads as "covered" (depth < 1.0)
		// while looking like an empty gap - catch it here so it goes through the same fill path.
		bool weaklyCovered = depth < 1.0 && color.w < float(FILL_GAPS_MIN_COVERAGE_WEIGHT);
	#endif

	#if defined(points_blend)
		// A pixel with no colour weight has nothing to show, even if the depth pre-pass covered it.
		shouldDiscard = shouldDiscard || color.w <= 0.0;
		color = color / max(color.w, MIN_BLEND_WEIGHT);
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

			// Eye distance per tap of the current step, filled by pass 1 and reused by pass 2 so
			// the window is only sampled once.
			float neighbourEyes[FILL_GAPS_TAPS];

			for (int stepIndex = 0; stepIndex < FILL_GAPS_STEPS; stepIndex++) {
				int stride = 1 << stepIndex;

				// Pass 1: find the nearest covered neighbour in this window. This anchors what
				// "same surface" means below, BEFORE we look at the rest of the window - so a
				// background surface glimpsed past a thin foreground feature (a pole against a
				// railing behind it) never gets a vote in what counts as coverage.
				//
				// The pixel the colour is copied from is tracked separately: under point blending
				// it must carry real colour weight, or normalizing it reads garbage.
				float nearEye = 1.0e30;
				float sourceEye = 1.0e30;
				vec2 sourceCandidateUv = vUv;
				bool anyCovered = false;

				for (int y = -FILL_GAPS_RADIUS; y <= FILL_GAPS_RADIUS; y++) {
					for (int x = -FILL_GAPS_RADIUS; x <= FILL_GAPS_RADIUS; x++) {
						int tap = (y + FILL_GAPS_RADIUS) * FILL_GAPS_DIAMETER + (x + FILL_GAPS_RADIUS);
						neighbourEyes[tap] = FILL_GAPS_EMPTY;

						if (x == 0 && y == 0) {
							continue;
						}

						vec2 uvNeighbour = vUv + vec2(float(x * stride), float(y * stride)) * texel;
						float neighbourEye = gapFillNeighbourEye(uvNeighbour);
						neighbourEyes[tap] = neighbourEye;

						if (neighbourEye == FILL_GAPS_EMPTY) {
							continue;
						}

						anyCovered = true;
						nearEye = min(nearEye, neighbourEye);

						#if defined(points_blend)
							float neighbourWeight = textureLod(tDiffuse, uvNeighbour, 0.0).w;
							bool canSource = neighbourWeight >= max(float(FILL_GAPS_MIN_COVERAGE_WEIGHT), MIN_BLEND_WEIGHT);
						#else
							bool canSource = true;
						#endif

						if (canSource && neighbourEye < sourceEye) {
							sourceEye = neighbourEye;
							sourceCandidateUv = uvNeighbour;
						}
					}
				}

				if (!anyCovered) {
					continue;
				}

				float reachPixels = float(stride * FILL_GAPS_RADIUS);
				float worldPerPixelAtSurface = orthographicCamera ? worldPerPixel : worldPerPixel * nearEye;
				float worldWindow = max(worldPerPixelAtSurface, 0.0) * reachPixels;

				// 1. Camera-distance gate: only bridge a hole up to this size in the WORLD.
				//    A fixed world size projects to many pixels up close, few from far away.
				bool withinWorldGap = worldPerPixel <= 0.0 || worldWindow <= float(FILL_GAPS_MAX_WORLD_GAP);

				// Spread a real (even steeply grazing) surface could have over this window -
				// used to tell the nearest surface apart from anything behind it, before
				// coverage is counted.
				float allowedSpread = nearEye * float(FILL_GAPS_DEPTH_TOL) + float(FILL_GAPS_GRAZE_TOL) * worldWindow;

				// The colour source has to lie on that same nearest surface.
				bool sourceOnSurface = sourceEye - nearEye <= allowedSpread;

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
						int tap = (y + FILL_GAPS_RADIUS) * FILL_GAPS_DIAMETER + (x + FILL_GAPS_RADIUS);
						float neighbourEye = neighbourEyes[tap];

						if (neighbourEye == FILL_GAPS_EMPTY) {
							continue;
						}

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

				if (withinWorldGap && sourceOnSurface && covered >= FILL_GAPS_MIN_COVERED && surrounded) {
					filledUv = sourceCandidateUv;
					filled = true;
					break;
				}
				// Otherwise keep widening - a tighter window can miss same-surface coverage that
				// a wider one still finds.
			}

			if (filled) {
				sourceUv = filledUv;
				color = textureLod(tDiffuse, filledUv, 0.0);
				#if defined(points_blend)
					color = color / max(color.w, MIN_BLEND_WEIGHT);
				#endif
				depth = textureLod(tDepth, filledUv, 0.0).r;
				shouldDiscard = false;
				outputColor = vec4(color.rgb, 1.0);
				gl_FragDepth = depth;
			}
		}
	#endif

	#if defined(use_edl)
		#if defined (points_blend)
			// Read at the source pixel: a filled gap has no log depth of its own, and reading 0
			// there would make EDL treat it as outside the cloud and shade it black.
			float edlDepth = textureLod(tLogDepth, sourceUv, 0.0).a;
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

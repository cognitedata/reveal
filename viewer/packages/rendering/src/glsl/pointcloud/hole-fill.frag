precision highp float;
precision highp int;

// Depth-aware screen-space hole filling for point clouds.
//
// When the camera is close to a point cloud the deepest available octree nodes no longer
// provide enough points to cover every pixel, leaving gaps that show whatever is behind the
// surface. This pass fills an empty pixel from its nearest covered neighbour, so small gaps
// close up without inflating point sizes. Running it for several iterations widens the maximum
// gap that can be closed by one pixel per iteration.

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform vec2 texelSize;

in vec2 vUv;

out vec4 outputColor;

void main() {
	float centerDepth = texture(tDepth, vUv).r;
	vec4 centerColor = texture(tDiffuse, vUv);

	// Pixel already covered by a point - pass through untouched.
	if (centerDepth < 1.0) {
		outputColor = centerColor;
		gl_FragDepth = centerDepth;
		return;
	}

	// Empty pixel: adopt the nearest covered neighbour. Filling from the nearest (smallest
	// depth) neighbour stops a near surface's gap from being filled by a farther surface that
	// is visible through it.
	float nearestDepth = 1.0;
	vec4 nearestColor = vec4(0.0);
	int coveredNeighbours = 0;

	for (int y = -1; y <= 1; y++) {
		for (int x = -1; x <= 1; x++) {
			if (x == 0 && y == 0) {
				continue;
			}

			vec2 uvNeighbour = vUv + vec2(float(x), float(y)) * texelSize;
			float neighbourDepth = texture(tDepth, uvNeighbour).r;

			if (neighbourDepth >= 1.0) {
				continue;
			}

			coveredNeighbours++;

			if (neighbourDepth < nearestDepth) {
				nearestDepth = neighbourDepth;
				nearestColor = texture(tDiffuse, uvNeighbour);
			}
		}
	}

	// Require the hole to be mostly enclosed by geometry so the point cloud's outer
	// silhouette against the background is left untouched.
	if (coveredNeighbours < 3) {
		discard;
	}

	outputColor = nearestColor;
	gl_FragDepth = nearestDepth;
}

/*
 * Triangular-PDF (TPDF) ordered dither to hide 8-bit quantization banding on
 * smooth gradients (slow gradients over large areas).
 *
 * Apply in the final display-encoded (sRGB) space, right before the value is
 * written to an 8-bit render target. TPDF (the sum of two independent uniform
 * samples) fully decorrelates the quantization error from the signal, so the
 * added noise does not visibly modulate with brightness the way uniform dither
 * does. Amplitude is +/- 1 LSB (1/255).
 *
 * A cheap per-pixel hash provides the noise (static per fragment, so no
 * shimmer on a still frame). For the perceptually best result, swap the hash
 * for a tiled blue-noise texture lookup.
 */

// Hash from Dave Hoskins (https://www.shadertoy.com/view/4djSRW), maps a 2D
// coordinate to a uniform pseudo-random value in [0, 1).
float ditherHash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Adds +/- 1 LSB triangular-PDF dither to an sRGB-encoded color. `amount`
// scales the dither (0 = off, 1 = full +/- 1 LSB) so it can be toggled at
// runtime via a uniform.
vec3 ditherTriangularNoise(vec3 color, vec2 fragCoord, float amount) {
    float r1 = ditherHash12(fragCoord);
    float r2 = ditherHash12(fragCoord + vec2(37.0, 17.0));
    float tpdf = r1 + r2 - 1.0; // triangular PDF in [-1, 1]
    return color + amount * (tpdf / 255.0);
}

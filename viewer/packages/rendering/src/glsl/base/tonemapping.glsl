/*
 * ACES filmic tone mapping - fitted approximation by Stephen Hill (@self_shadow),
 * as used by Unreal and many others.
 *
 * Unlike a naive per-channel curve (e.g. Reinhard or Narkowicz's cheap ACES fit
 * applied component-wise), this sandwiches the RRT+ODT fit between the ACES input
 * and output color-space matrices. Those matrices mix the channels, so the
 * operator has cross-talk: bright, saturated colors desaturate toward white as
 * they roll off, matching how film/real tone mapping behaves.
 *
 * Input is linear HDR radiance; output is linear display-referred color in [0, 1]
 * (still needs an sRGB/OETF encode before being written to the screen).
 */

// sRGB/Rec.709 linear -> ACES2065-1 working space (AP0-ish input transform).
const mat3 ACESInputMat = mat3(
    0.59719, 0.07600, 0.02840,
    0.35458, 0.90834, 0.13383,
    0.04823, 0.01566, 0.83777
);

// ACES working space -> sRGB/Rec.709 linear (output transform).
const mat3 ACESOutputMat = mat3(
     1.60475, -0.10208, -0.00327,
    -0.53108,  1.10813, -0.07276,
    -0.07367, -0.00605,  1.07602
);

// Combined RRT (reference rendering transform) and ODT (output device transform)
// fit - a rational tone curve applied in the ACES working space.
vec3 rrtAndOdtFit(vec3 v) {
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return a / b;
}

vec3 acesFitted(vec3 color) {
    color = ACESInputMat * color;
    color = rrtAndOdtFit(color);
    color = ACESOutputMat * color;
    return clamp(color, 0.0, 1.0);
}

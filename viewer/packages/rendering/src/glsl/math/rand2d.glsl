// From http://www.science-and-fiction.org/rendering/noise.html
float rand2d(in vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

// Interleaved gradient noise (Jorge Jimenez, "Next Generation Post Processing in
// Call of Duty: Advanced Warfare"). A cheap, well-distributed screen-space hash
// that avoids the banding / GPU-precision issues of a sin-based hash and gives a
// much better per-pixel rotation for screen-space sampling (e.g. SSAO). Feed it
// gl_FragCoord.xy (pixel coordinates).
float interleavedGradientNoise(in vec2 fragCoord){
    return fract(52.9829189 * fract(dot(fragCoord, vec2(0.06711056, 0.00583715))));
}

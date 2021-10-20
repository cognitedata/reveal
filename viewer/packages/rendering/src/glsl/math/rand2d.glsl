// From http://www.science-and-fiction.org/rendering/noise.html
float rand2d(in vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

#pragma glslify: export(rand2d)

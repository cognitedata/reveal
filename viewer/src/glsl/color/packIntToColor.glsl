/**
 * Packs the integer part of the number given to a RGB color.
 */
vec3 packIntToColor(float number) {
    float r = floor(number / (255.0 * 255.0)) / 255.0;
    float g = mod(floor(number / 255.0), 255.0) / 255.0;
    float b = mod(number, 255.0) / 255.0;    
    return vec3(r,g,b);
}

#pragma glslify: export(packIntToColor)

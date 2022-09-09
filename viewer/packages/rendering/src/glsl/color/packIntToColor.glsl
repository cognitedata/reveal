/**
 * Packs the integer part of the number given to a RGB color.
 */
vec3 packIntToColor(int number) {
    float r = floor(float(number) / (255.0 * 255.0)) / 255.0;
    float g = mod(floor(float(number) / 255.0), 255.0) / 255.0;
    float b = mod(float(number), 255.0) / 255.0;
    return vec3(r, g, b);
}

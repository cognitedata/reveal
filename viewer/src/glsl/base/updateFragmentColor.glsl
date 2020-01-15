#pragma glslify: rgb2hsv = require('../color/rgb2hsv.glsl')
#pragma glslify: hsv2rgb = require('../color/hsv2rgb.glsl')
#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

#ifdef COGNITE_COLOR_BY_TREE_INDEX

void updateFragmentColor(vec3 color, float treeIndex, vec3 normal) {
    color = packIntToColor(treeIndex);
    float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
    gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), 1.0);
}

#else 

void updateFragmentColor(vec3 color, float treeIndex, vec3 normal) {
    vec3 hsv = rgb2hsv(color);
    hsv.z = min(0.6 * hsv.z + 0.4, 1.0);
    color = hsv2rgb(hsv);
    float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
    gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), 1.0);
}

#endif

#pragma glslify: export(updateFragmentColor)

#pragma glslify: rgb2hsv = require('../color/rgb2hsv.glsl')
#pragma glslify: hsv2rgb = require('../color/hsv2rgb.glsl')
#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

const int RenderTypeColor = 1;
const int RenderTypeNormal = 2;
const int RenderTypeTreeIndex = 3;

uniform int renderType;

vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}

#ifdef COGNITE_COLOR_BY_TREE_INDEX

void updateFragmentColor(vec3 color, float treeIndex, vec3 normal) {
}

#else

void updateFragmentColor(vec3 color, float treeIndex, vec3 normal) {
    if (renderType == RenderTypeColor) {
        vec3 hsv = rgb2hsv(color);
        hsv.z = min(0.6 * hsv.z + 0.4, 1.0);
        color = hsv2rgb(hsv);
        float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
        gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), 1.0);
    } else if (renderType == RenderTypeNormal) {
        gl_FragColor = vec4(packNormalToRGB(normal), 1.0);
    } else if (renderType == RenderTypeTreeIndex) {
        color = packIntToColor(treeIndex);
        float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
        gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), 1.0);
    } else {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}

#endif

#pragma glslify: export(updateFragmentColor)

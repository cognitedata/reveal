#pragma glslify: rgb2hsv = require('../color/rgb2hsv.glsl')
#pragma glslify: hsv2rgb = require('../color/hsv2rgb.glsl')
#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

uniform sampler2D colorDataTexture;

const int RenderTypeColor = 1;
const int RenderTypeNormal = 2;
const int RenderTypeTreeIndex = 3;
const int RenderTypePackColorAndNormal = 4;
const float dataTextureWidth = 2048.0;
const float dataTextureHeight = 2048.0;

vec3 packNormalToRGB( const in vec3 normal ) {
    return normalize( normal ) * 0.5 + 0.5;
}

// TODO remove input color
void updateFragmentColor(int renderMode, vec3 _color, float treeIndex, vec3 normal) {
    float u = mod(treeIndex, dataTextureWidth);
    float v = floor(treeIndex / dataTextureWidth);
    float uCoord = (u + 0.5) / dataTextureWidth;
    float vCoord = (v + 0.5) / dataTextureHeight; // invert Y axis
    vec2 treeIndexUv = vec2(uCoord, vCoord);
    vec3 color = texture2D(colorDataTexture, treeIndexUv).rgb;

    if (renderMode == RenderTypeColor) {
        vec3 hsv = rgb2hsv(color);
        float h = hsv.x;
        hsv.z = min(0.6 * hsv.z + 0.4, 1.0);
        color = hsv2rgb(hsv);
        float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
        gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), h);
    } else if (renderMode == RenderTypePackColorAndNormal) {
        vec3 hsv = rgb2hsv(color);
        float a = 0.0;
        if (hsv.y > 0.01) {
            if (hsv.z > 0.5) {
                // light color
                a = (0.55 + hsv.x * 0.45);
            } else {
                // dark color
                a = (0.1 + hsv.x * 0.45);
            }
        } else {
            // no saturation - grayscale
            a = hsv.z * 0.09;
        }
        gl_FragColor = vec4(packNormalToRGB(normal.rgb), a);
    } else if (renderMode == RenderTypeNormal) {
        gl_FragColor = vec4(packNormalToRGB(normal), 1.0);
    } else if (renderMode == RenderTypeTreeIndex) {
        color = packIntToColor(treeIndex);
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}

#pragma glslify: export(updateFragmentColor)

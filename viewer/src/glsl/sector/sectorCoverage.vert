#pragma glslify: packIntToColor = require('../color/packIntToColor.glsl')

attribute lowp vec3 a_translation;
attribute lowp vec3 a_scale;
attribute highp float a_sectorId;
attribute lowp float a_coverageFactor;

varying highp vec3 v_color;
varying lowp float v_coverageFactor;

void main()
{
    mat4 instanceMatrix = mat4(
        vec4(a_scale.x, 0.0, 0.0, 0.0), // Column 1
        vec4(0.0, a_scale.y, 0.0, 0.0), // Column 2
        vec4(0.0, 0.0, a_scale.z, 0.0), // Column 3
        vec4(a_translation, 1.0)        // Column 4
    );
    v_color = packIntToColor(a_sectorId);
    v_coverageFactor = a_coverageFactor;

    // vec3 transformed = (instanceMatrix * vec4(position, 1.0)).xyz;
    // vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
    vec4 modelViewPosition = modelViewMatrix * vec4(a_translation, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}

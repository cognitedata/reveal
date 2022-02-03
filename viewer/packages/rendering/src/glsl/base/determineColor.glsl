#pragma glslify: NodeAppearance = require('./nodeAppearance.glsl')

vec4 determineColor(vec3 originalColor, NodeAppearance nodeAppearance) {
    vec4 overrideColor = nodeAppearance.colorTexel;
    if (any(greaterThan(overrideColor.rgb, vec3(0.0)))) {
      return vec4(overrideColor.rgb, 1.0);
    }
    return vec4(originalColor.rgb, 1.0);
}

#pragma glslify: export(determineColor)

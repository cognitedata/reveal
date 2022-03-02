vec4 determineColor(vec3 originalColor, NodeAppearance nodeAppearance) {
    vec4 overrideColor = nodeAppearance.colorTexel;
    if (any(greaterThan(overrideColor.rgb, vec3(0.0)))) {
      return overrideColor;
    }
    return vec4(originalColor.rgb, overrideColor.a);
}


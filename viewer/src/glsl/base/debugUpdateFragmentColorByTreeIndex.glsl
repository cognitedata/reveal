void debugUpdateFragmentColorByTreeIndex(float treeIndex, vec3 normal) {
    float r = floor(treeIndex / (255.0 * 255.0)) / 255.0;
    float g = mod(floor(treeIndex / 255.0), 255.0) / 255.0;
    float b = mod(treeIndex, 255.0) / 255.0;    
    vec3 color = vec3(r,g,b);
    
    float amplitude = max(0.0, dot(normal, vec3(0.0, 0.0, 1.0)));
    gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), 1.0);
}

#pragma glslify: export(debugUpdateFragmentColorByTreeIndex)

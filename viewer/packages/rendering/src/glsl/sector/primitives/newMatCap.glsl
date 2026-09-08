// Relies on updateFragmentColor.glsl (included before this file by the fragment
// shader) to provide `outputColor` and, transitively via worldSpaceVectors.glsl,
// the world-space lighting helpers (computeWorldSpaceVectors, g_world*).

vec3 matCapFunc(vec3 direction) {
	vec3 sunlightDirection = normalize(vec3(0.2, 0.5, 1.0));
	vec3 result = vec3(0.0);
	float sunlight =  smoothstep(0.9, 1.0, dot(direction, sunlightDirection));
	result += sunlight;
	if (direction.z > 0.0) {
		result += vec3(0.0, 0.2, 0.8);
	} else {
		result += vec3(0.05);
	}

	return result;
}


vec3 newMatCap(vec3 normal, vec3 viewPosition, mat4 modelViewMatrix, sampler2D matCapTexture) {
	// The world-space vectors are computed in the helper and exposed as globals
	// (g_worldNormal, g_worldReflection, ...).
	computeWorldSpaceVectors(normal, viewPosition, modelViewMatrix);

	// Matcap
	vec2 cap = g_worldReflection.xy * 0.5 + 0.5;
	vec4 mc = vec4(texture(matCapTexture, cap).rgb, 1.0);
	vec3 matCapValue = matCapFunc(g_worldNormal);

	// outputColor = vec4(max(0.0, g_worldReflection.z) * vec3(1.0), 1.0);
	outputColor.xyz = matCapValue;
	// outputColor.xyz = g_worldNormal;

	return g_worldReflection;
}

vec3 pbr_ish() { return vec3(0.0); }

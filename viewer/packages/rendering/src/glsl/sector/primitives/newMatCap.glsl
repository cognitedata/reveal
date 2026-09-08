
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
	mat4 viewToSectorMatrix = inverse(modelViewMatrix);
	vec3 sectorNormal = (viewToSectorMatrix * vec4(normal, 0.0)).xyz;
	vec3 sectorPosition = (viewToSectorMatrix * vec4(viewPosition, 1.0)).xyz;
	vec3 sectorCameraPosition = (viewToSectorMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

	vec3 sectorRayDirection = normalize(sectorPosition - sectorCameraPosition);

	vec3 reflectionRay = reflect(sectorRayDirection, sectorNormal);


	// Matcap
        vec2 cap = reflectionRay.xy * 0.5 + 0.5;
        vec4 mc = vec4(texture(matCapTexture, cap).rgb, 1.0);
	vec3 matCapValue = matCapFunc(sectorNormal);

	// outputColor = vec4(max(0.0, reflectionRay.z) * vec3(1.0), 1.0);
	outputColor.xyz = matCapValue;
	// outputColor.xyz = sectorNormal;

	return reflectionRay;
}

vec3 pbr_ish() { return vec3(0.0); }

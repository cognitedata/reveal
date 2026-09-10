
// uniform sampler2D skyboxTexture;
// uniform sampler2D skyboxLowPassTexture;

vec2 equirectangularUV(vec3 direction) {
	// float PI = 3.1415;
	float equirectangularU = atan(direction.y, direction.x) / (2.0 * PI) + 0.5;
	float equirectangularV = asin(direction.z) / PI + 0.5;
	return vec2(equirectangularU, equirectangularV);
}


vec3 sampleDirection(sampler2D tex, vec3 direction) {
	vec3 sectorNormal = g_worldNormal;
	vec3 sectorPosition = g_worldPosition;
	vec3 sectorCameraPosition = g_worldCameraPosition;

	vec3 sectorRayDirection = normalize(sectorPosition - sectorCameraPosition);

	vec3 reflectionRay = reflect(sectorRayDirection, sectorNormal);

	vec2 specularEquiUv = equirectangularUV(reflectionRay);
	vec2 diffuseEquiUv = equirectangularUV(sectorNormal);

	return texture(tex, specularEquiUv).rgb;
}

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


vec3 newMatCap(vec3 normal, vec3 viewPosition, sampler2D matCapTexture) {
	vec3 sectorNormal = g_worldNormal;
	vec3 sectorPosition = g_worldPosition;
	vec3 sectorCameraPosition = g_worldCameraPosition;

	vec3 sectorRayDirection = normalize(sectorPosition - sectorCameraPosition);

	vec3 reflectionRay = reflect(sectorRayDirection, sectorNormal);

	vec2 specularEquiUv = equirectangularUV(reflectionRay);
	vec2 diffuseEquiUv = equirectangularUV(sectorNormal);

	vec4 skyboxSpecularSample = texture(skyboxTexture, specularEquiUv);
	vec4 skyboxDiffuseSample = texture(skyboxLowPassTexture, diffuseEquiUv);

	float specularStrength = 0.3;

	vec4 result = skyboxSpecularSample * specularStrength + skyboxDiffuseSample * (1.0 - specularStrength);

	if (result == vec4(0.0)) {
		// Matcap
		vec2 cap = reflectionRay.xy * 0.5 + 0.5;
		vec4 matcapTextureValue = texture(matCapTexture, cap);
		// vec3 matCapValue = matCapFunc(reflectionRay);

		// outputColor = vec4(max(0.0, reflectionRay.z) * vec3(1.0), 1.0);
		result = matcapTextureValue;
		// outputColor.xyz = matCapValue;
	}
	// outputColor.xyz = sectorNormal;

	return result.rgb;
}

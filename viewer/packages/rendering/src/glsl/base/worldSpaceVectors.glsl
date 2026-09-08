/*
 * World-space vectors used for lighting.
 *
 * `computeWorldSpaceVectors` takes the same inputs as `newMatCap` (minus the
 * matcap texture) and writes the resulting vectors into the globals below.
 * This lets other functions - e.g. updateFragmentColor - read them without
 * having to thread the vectors through their function signatures.
 *
 * Populate them once per fragment (in the shader's main(), where the
 * modelViewMatrix and the view-space position are available) before reading:
 *
 *   computeWorldSpaceVectors(normal, viewPosition, modelViewMatrix);
 *   ... g_worldNormal, g_worldReflection, ... are now valid ...
 *
 * NOTE: these are strictly speaking sector/model space (the space reached by
 * inverting the modelViewMatrix), which is what Reveal treats as world space.
 */

// Surface normal in world space.
vec3 g_worldNormal;
// Surface position in world space.
vec3 g_worldPosition;
// Camera position in world space.
vec3 g_worldCameraPosition;
// Normalized direction from the camera towards the surface, in world space.
vec3 g_worldRayDirection;
// View ray reflected about the surface normal, in world space.
vec3 g_worldReflection;

// True once computeWorldSpaceVectors has populated the vectors above for the
// current fragment. Lets consumers (e.g. updateFragmentColor) fall back
// gracefully in shaders that never compute these vectors.
bool g_worldVectorsValid = false;

void computeWorldSpaceVectors(vec3 normal, vec3 viewPosition, mat4 modelViewMatrix) {
    mat4 viewToSectorMatrix = inverse(modelViewMatrix);

    g_worldNormal = (viewToSectorMatrix * vec4(normal, 0.0)).xyz;
    g_worldPosition = (viewToSectorMatrix * vec4(viewPosition, 1.0)).xyz;
    g_worldCameraPosition = (viewToSectorMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

    g_worldRayDirection = normalize(g_worldPosition - g_worldCameraPosition);
    g_worldReflection = reflect(g_worldRayDirection, g_worldNormal);

    g_worldVectorsValid = true;
}

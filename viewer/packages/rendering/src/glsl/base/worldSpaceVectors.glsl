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

    // Guard against degenerate / NaN analytic normals. Cone and eccentric-cone
    // normals come from cross products that collapse to zero along a seam
    // (normalize(0) -> NaN); without this guard those NaNs propagate through the
    // lighting and show up as a harsh black edge. `!(x > 0.0)` also catches NaN.
    vec3 viewNormal = normal;
    if (!(dot(viewNormal, viewNormal) > 0.0)) {
        viewNormal = vec3(0.0, 0.0, 1.0);
    }

    // Normals must be transformed by the inverse-transpose of the position
    // transform. Going view -> sector the position transform is
    // inverse(modelViewMatrix), whose inverse-transpose is
    // transpose(mat3(modelViewMatrix)). Using inverse(modelViewMatrix) directly
    // (as for a position/direction) skews normals under non-uniform scaling.
    mat3 normalViewToSector = transpose(mat3(modelViewMatrix));

    g_worldNormal = normalize(normalViewToSector * viewNormal);
    g_worldPosition = (viewToSectorMatrix * vec4(viewPosition, 1.0)).xyz;
    g_worldCameraPosition = (viewToSectorMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

    g_worldRayDirection = normalize(g_worldPosition - g_worldCameraPosition);

    // Orient the lighting normal to face the camera along the actual view ray.
    // The analytic primitive normals - especially the cone / eccentric-cone
    // cross products - can have an inconsistent sign across the surface (their
    // sign flips across the axis-plane seam). Each primitive then force-flips the
    // normal to face the camera in *view* space, which hides the inconsistency
    // for the camera-relative matcap but leaves the two halves with opposite
    // normals in world space - so world-space lighting shows one half "flipped".
    // For these convex, outward-facing surfaces the camera-facing normal is the
    // correct outward normal, so re-derive the orientation here from the real
    // view ray. (Only affects g_worldNormal used for lighting, not the view-space
    // `normal` the legacy matcap path still uses.)
    if (dot(g_worldNormal, g_worldRayDirection) > 0.0) {
        g_worldNormal = -g_worldNormal;
    }

    g_worldReflection = reflect(g_worldRayDirection, g_worldNormal);

    g_worldVectorsValid = true;
}

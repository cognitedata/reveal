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

    // NOTE: no orientation flip is applied here. Each primitive is responsible
    // for handing us a correctly oriented, camera-facing normal:
    //   - cone / eccentric-cone / ellipsoid orient against the per-fragment view
    //     ray in their own shader (the correct choice for a curved surface whose
    //     analytic cross-product normal has an inconsistent sign),
    //   - the general cylinder orients via its intersection `normalFactor`,
    //   - flat primitives (disc / ring / trapezium) and meshes/tori supply an
    //     authored, outward geometric normal.
    // A flip in this shared helper cannot be correct for all of them at once:
    //   - flipping against the per-fragment view ray couples a flat disc's
    //     shading to which side it is viewed from, snapping it lit<->dark at the
    //     edge-on angle (a hard "clip"),
    //   - flipping against the view axis (viewNormal.z) wrongly inverts the
    //     silhouette bands of a curved surface whose outward normal tilts past
    //     the axis, and pops flat polygonal faces as they cross it.
    // Trusting the per-primitive normal avoids both.

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
    g_worldReflection = reflect(g_worldRayDirection, g_worldNormal);

    g_worldVectorsValid = true;
}

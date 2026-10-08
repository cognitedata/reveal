// EXPERIMENTAL: "realistic" shading for CAD geometry, off by default (CadMaterialManager.setRealisticShading).
//
// Replaces the headlight + matcap look with:
// - material guesses from the CAD color (painted surface, bare steel, deck plate),
// - procedural detail in model space (meters): grime, rain streaks, paint wear, diamond-plate decks, bump detail.
//   Detail fades out when it gets smaller than a pixel, so it doesn't shimmer at a distance,
// - physically based lighting: a sun, a sky/ground environment for diffuse and reflections, ACES tone mapping.
// Lighting is fixed in world space (y up), so it doesn't change when the camera rotates.
// Optional inputs from the application: detail textures, a sky texture, a sun shadow map, the sun, and weather.

uniform mat4 modelMatrix;
uniform bool realisticShading;
// Optional detail textures (0.5 = no change; albedo is multiplied by 2 * value). Generated with gpt-image, made
// tileable offline. Without them, procedural detail is used.
uniform bool realisticTexturesEnabled;
uniform sampler2D realisticPaintTexture;
uniform sampler2D realisticStreaksTexture;
uniform sampler2D realisticDeckTexture;
uniform sampler2D realisticMetalTexture;

// Optional sun shadow map (depth from a distant sun camera), rendered by the app. The sampler is only declared once a
// map has been provided (REALISTIC_SHADOWS): an unset shadow sampler would make every draw call fail.
uniform bool realisticShadowsEnabled;
#if defined(REALISTIC_SHADOWS)
uniform highp sampler2DShadow realisticShadowMap; // hardware depth comparison with bilinear filtering (PCF)
#endif
uniform mat4 realisticShadowMatrix; // world -> shadow camera clip space
uniform float realisticShadowTexelSize; // in shadow map uv
uniform float realisticShadowWorldTexel; // world units per shadow map texel

// Optional sky texture (equirectangular upper hemisphere: u = azimuth, v = elevation / 90 degrees, display-referred
// sRGB) for reflections and ambient light. Without it, the analytic sky gradient is used.
uniform bool realisticSkyEnabled;
uniform sampler2D realisticSkyTexture;
uniform bool realisticSplashZone;
// Weather: 0 = sunny with a few clouds, 1 = heavy rain. Time (seconds) drifts the clouds and their shadows.
uniform float realisticOvercast;
uniform float realisticTime;
const float CLOUD_DRIFT = 1.0 / 2400.0; // sky panorama turns per second
const float SKY_RADIANCE_SCALE = 1.25;
const vec3 SEA_RADIANCE = vec3(0.012, 0.035, 0.055);

// Texture tile sizes in model meters.
const float PAINT_TILE = 1.2;
const float STREAKS_TILE = 2.5;
const float DECK_TILE = 0.45;
const float METAL_TILE = 0.9;

// The sun: world space direction toward it (normalized below) and its color before clouds dim it.
uniform vec3 realisticSunDirection;
uniform vec3 realisticSunColor;
#define SUN_DIRECTION realisticSunDirection
#define SUN_COLOR realisticSunColor
const vec3 SKY_ZENITH = vec3(0.16, 0.34, 0.66);
const vec3 SKY_HORIZON = vec3(0.62, 0.72, 0.82);
const vec3 GROUND_COLOR = vec3(0.16, 0.17, 0.18);
const float EXPOSURE = 1.05;
const float REALISTIC_PI = 3.14159265;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), u.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), u.x), u.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), u.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), u.x), u.y),
    u.z);
}

// Fraction of a feature with the given frequency (per meter) that survives at this pixel footprint (meters/pixel).
float detailVisibility(float frequency, float footprint) {
  return 1.0 - smoothstep(0.25, 0.5, footprint * frequency);
}

// Fractal noise in [0, 1], with octaves smaller than a pixel faded out.
float fbm(vec3 p, float frequency, float footprint, int octaves) {
  float sum = 0.0;
  float weight = 0.0;
  float amplitude = 1.0;
  for (int i = 0; i < 4; i++) {
    if (i >= octaves) break;
    float visibility = detailVisibility(frequency, footprint);
    sum += amplitude * visibility * valueNoise(p * frequency);
    weight += amplitude * visibility;
    // Faded octaves contribute their average instead of noise.
    sum += amplitude * (1.0 - visibility) * 0.5;
    weight += amplitude * (1.0 - visibility);
    frequency *= 2.03;
    amplitude *= 0.5;
  }
  return sum / weight;
}

// Height of a diamond (tread) plate pattern in meters, for up-facing deck surfaces.
float diamondPlateHeight(vec2 p) {
  const float pitch = 0.028;
  vec2 cell = floor(p / pitch);
  vec2 local = fract(p / pitch) - 0.5;
  // Alternate the orientation of the raised diamonds.
  float flip = mod(cell.x + cell.y, 2.0) * 2.0 - 1.0;
  vec2 axis = normalize(vec2(1.0, flip));
  float along = dot(local, axis);
  float across = dot(local, vec2(-axis.y, axis.x));
  float d = length(vec2(along / 0.42, across / 0.12));
  return (1.0 - smoothstep(0.75, 1.0, d)) * 0.0012;
}

// Bump mapping without tangents (Mikkelsen 2010): perturbs n by the screen-space gradient of a height field.
vec3 perturbNormal(vec3 n, vec3 position, float height) {
  vec3 dpdx = dFdx(position);
  vec3 dpdy = dFdy(position);
  float dhdx = dFdx(height);
  float dhdy = dFdy(height);
  vec3 r1 = cross(dpdy, n);
  vec3 r2 = cross(n, dpdx);
  float det = dot(dpdx, r1);
  if (abs(det) < 1e-12) {
    return n;
  }
  vec3 surfaceGradient = sign(det) * (dhdx * r1 + dhdy * r2);
  return normalize(abs(det) * n - surfaceGradient);
}

// Triplanar sample: projections along the model axes, blended by the normal.
vec3 triplanar(sampler2D detailTexture, vec3 position, vec3 normal, float tile) {
  vec3 weights = pow(abs(normal), vec3(4.0));
  weights /= weights.x + weights.y + weights.z;
  vec3 p = position / tile;
  return texture(detailTexture, p.yz).rgb * weights.x + texture(detailTexture, p.xz).rgb * weights.y +
    texture(detailTexture, p.xy).rgb * weights.z;
}

// Fraction of sunlight reaching the point (soft shadows with Poisson-disc filtering).
float sunVisibility(vec3 worldPosition, vec3 worldNormal, vec3 worldSun) {
#if !defined(REALISTIC_SHADOWS)
  return 1.0;
#else
  if (!realisticShadowsEnabled) {
    return 1.0;
  }
  // Offset along the normal to avoid self-shadowing (acne). The filter compares depths up to 2.5 texels away, so
  // the offset grows with the receiver's slope as seen from the sun.
  float cosTheta = clamp(dot(worldNormal, worldSun), 0.05, 1.0);
  float slope = min(sqrt(1.0 - cosTheta * cosTheta) / cosTheta, 2.0);
  vec3 p = worldPosition + worldNormal * realisticShadowWorldTexel * (1.0 + 2.5 * slope);
  vec4 clip = realisticShadowMatrix * vec4(p, 1.0);
  vec3 uvz = clip.xyz / clip.w * 0.5 + 0.5;
  if (any(lessThan(uvz, vec3(0.0))) || any(greaterThan(uvz, vec3(1.0)))) {
    return 1.0;
  }
  const vec2 poisson[12] = vec2[12](
    vec2(-0.326, -0.406), vec2(-0.840, -0.074), vec2(-0.696, 0.457), vec2(-0.203, 0.621),
    vec2(0.962, -0.195), vec2(0.473, -0.480), vec2(0.519, 0.767), vec2(0.185, -0.893),
    vec2(0.507, 0.064), vec2(0.896, 0.412), vec2(-0.322, -0.933), vec2(-0.792, -0.598));
  // Rotate the disc per pixel (interleaved gradient noise), turning the stair-steps of the shadow map texels into
  // fine noise that the eye and the MSAA resolve smooth out.
  float angle = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  mat2 rotation = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
  float lit = 0.0;
  for (int i = 0; i < 12; i++) {
    vec2 offset = rotation * poisson[i] * realisticShadowTexelSize * 2.5;
    lit += texture(realisticShadowMap, vec3(uvz.xy + offset, uvz.z - 0.00005));
  }
  return lit / 12.0;
#endif
}

vec3 skyRadiance(vec3 direction, vec3 up) {
  float h = dot(direction, up);
  vec3 sky = mix(SKY_HORIZON, SKY_ZENITH, smoothstep(0.0, 0.7, h));
  return mix(GROUND_COLOR, sky, smoothstep(-0.08, 0.04, h));
}

// Clouds closing in: the sky turns a flat grey, brighter toward the zenith, keeping a hint of the cloud structure, and
// darker as it starts raining. Same as in the app's sky dome.
vec3 overcastSky(vec3 sky, float elevation, float overcast) {
  float luma = dot(sky, vec3(0.2126, 0.7152, 0.0722));
  vec3 grey = vec3(0.56, 0.6, 0.64) * (0.75 + 0.35 * elevation) * (0.8 + 0.25 * luma);
  return mix(sky, grey, smoothstep(0.0, 0.6, overcast)) * (1.0 - 0.45 * smoothstep(0.5, 1.0, overcast));
}

// Sky radiance in a world direction from the sky texture, blurred by mip level. Below the horizon: the sea.
vec3 skyTextureRadiance(vec3 worldDirection, float lod) {
  float elevation = asin(clamp(worldDirection.y, 0.0, 1.0)) / 1.5707963;
  float u = 0.5 + atan(worldDirection.x, -worldDirection.z) / 6.2831853;
  vec3 sky = pow(textureLod(realisticSkyTexture, vec2(u + realisticTime * CLOUD_DRIFT, elevation), lod).rgb, vec3(2.2)) *
    SKY_RADIANCE_SCALE;
  sky = overcastSky(sky, elevation, realisticOvercast);
  return mix(SEA_RADIANCE * (1.0 - 0.5 * realisticOvercast), sky, smoothstep(-0.06, 0.02, worldDirection.y));
}

vec3 acesTonemap(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

// Karis' analytic approximation of the split-sum environment BRDF.
vec3 environmentBrdf(vec3 f0, float roughness, float nDotV) {
  const vec4 c0 = vec4(-1.0, -0.0275, -0.572, 0.022);
  const vec4 c1 = vec4(1.0, 0.0425, 1.04, -0.04);
  vec4 r = roughness * c0 + c1;
  float a004 = min(r.x * r.x, exp2(-9.28 * nDotV)) * r.x + r.y;
  vec2 ab = vec2(-1.04, 1.04) * a004 + r.zw;
  return f0 * ab.x + ab.y;
}

// sRGB base color, view-space normal and position in, sRGB color out.
vec3 shadeRealistic(vec3 inputColor, vec3 viewNormal, vec3 viewPosition) {
  // CAD vertex colors arrive unnormalized (Uint8 0-255); styled-node override colors are 0-1.
  vec3 baseColor = max(inputColor.r, max(inputColor.g, inputColor.b)) > 1.0 ? inputColor / 255.0 : inputColor;
  mat3 viewRotation = mat3(viewMatrix);
  vec3 worldPosition = transpose(viewRotation) * (viewPosition - viewMatrix[3].xyz);
  float modelScale = length(modelMatrix[0].xyz);
  vec3 modelPosition = (inverse(modelMatrix) * vec4(worldPosition, 1.0)).xyz;
  vec3 worldNormal = transpose(viewRotation) * viewNormal;
  vec3 modelNormal = normalize(transpose(mat3(modelMatrix)) * worldNormal);
  // Up in model space (CDF models are z-up; the model matrix rotates them to Reveal's y-up world).
  vec3 modelUp = normalize(transpose(mat3(modelMatrix)) * vec3(0.0, 1.0, 0.0));
  float modelHeight = dot(modelPosition, modelUp);
  vec3 horizontalPosition = modelPosition - modelUp * modelHeight;
  vec3 horizontalAxis1 = normalize(abs(modelUp.x) < 0.9 ? cross(modelUp, vec3(1.0, 0.0, 0.0)) : cross(modelUp, vec3(0.0, 1.0, 0.0)));
  vec3 horizontalAxis2 = cross(modelUp, horizontalAxis1);
  float normalUp = dot(modelNormal, modelUp);
  // Size of a pixel on the surface, in model meters.
  float footprint = max(length(fwidth(modelPosition)), 1e-6);

  // Material from the CAD color.
  vec3 hsv = rgb2hsv(baseColor);
  // White and light grey on plants is almost always paint; mid greys are treated as galvanized/bare steel.
  bool painted = (hsv.y > 0.22 && hsv.z > 0.18) || hsv.z > 0.78;
  bool upFacing = normalUp > 0.93;
  bool deck = upFacing && hsv.y < 0.6;
  float metallic = painted ? 0.0 : 0.55;
  float roughness = painted ? 0.55 : 0.48;
  // CAD colors are authored for Reveal's classic shading, which brightens them a lot (value -> 0.5 * value + 0.5).
  // Lift them somewhat so the realistic look keeps the familiar colors.
  vec3 albedo = pow(hsv2rgb(vec3(hsv.x, hsv.y, 0.33 + 0.6 * hsv.z)), vec3(2.2));

  // Large-scale grime and color variation (meters).
  float grime = fbm(modelPosition, 0.35, footprint, 3);
  albedo *= mix(0.78, 1.08, grime);
  float height = 0.0;
  if (realisticTexturesEnabled) {
    if (painted) {
      vec3 paint = triplanar(realisticPaintTexture, modelPosition, modelNormal, PAINT_TILE) * 2.0;
      albedo *= paint;
      roughness = clamp(roughness + (0.5 - paint.g * 0.5) * 0.6, 0.1, 1.0);
      height += (paint.g - 1.0) * 0.0004;
    } else {
      vec3 metal = triplanar(realisticMetalTexture, modelPosition, modelNormal, METAL_TILE) * 2.0;
      albedo *= metal;
      roughness = clamp(roughness + (1.0 - metal.g) * 0.4, 0.1, 1.0);
    }
    // Rain streaks on vertical surfaces, projected onto the two vertical planes so they always run downwards.
    float verticality = 1.0 - abs(normalUp);
    if (verticality > 0.3) {
      vec2 w = abs(vec2(dot(modelNormal, horizontalAxis1), dot(modelNormal, horizontalAxis2)));
      w /= max(w.x + w.y, 1e-4);
      vec2 uv1 = vec2(dot(modelPosition, horizontalAxis2), modelHeight) / STREAKS_TILE;
      vec2 uv2 = vec2(dot(modelPosition, horizontalAxis1), modelHeight) / STREAKS_TILE;
      vec3 streaks = (texture(realisticStreaksTexture, uv1).rgb * w.x + texture(realisticStreaksTexture, uv2).rgb * w.y) * 2.0;
      albedo *= mix(vec3(1.0), streaks, smoothstep(0.3, 0.8, verticality));
    }
    if (deck) {
      vec2 deckCoordinates = vec2(dot(modelPosition, horizontalAxis1), dot(modelPosition, horizontalAxis2)) / DECK_TILE;
      float plate = texture(realisticDeckTexture, deckCoordinates).g;
      albedo *= mix(1.0, plate * 2.0, 0.6);
      roughness = mix(roughness, 0.4, 0.5);
      height += (plate - 0.5) * 0.0025 * detailVisibility(1.0 / 0.03, footprint);
    }
  } else {
    // Procedural fallback: fine variation (centimeters) in color and roughness.
    float fine = fbm(modelPosition + 17.0, 9.0, footprint, 2);
    albedo *= mix(0.94, 1.04, fine);
    roughness = clamp(roughness + (fine - 0.5) * 0.25, 0.08, 1.0);

    // Rain streaks: noise stretched vertically, on vertical surfaces.
    float verticality = 1.0 - abs(normalUp);
    float streaks = valueNoise(horizontalPosition * 7.0 + modelUp * modelHeight * 0.35);
    streaks = smoothstep(0.55, 0.92, streaks) * detailVisibility(7.0, footprint);
    albedo *= 1.0 - 0.22 * verticality * streaks;

    // Small patches of worn paint showing rust/primer underneath.
    if (painted) {
      float wear = fbm(modelPosition + 41.0, 6.0, footprint, 2);
      float worn = smoothstep(0.77, 0.82, wear) * detailVisibility(24.0, footprint) * 0.7;
      albedo = mix(albedo, vec3(0.16, 0.07, 0.03), worn);
      roughness = mix(roughness, 0.85, worn);
    }

    height = (fine - 0.5) * 0.0006;
    if (deck) {
      vec2 deckCoordinates = vec2(dot(modelPosition, horizontalAxis1), dot(modelPosition, horizontalAxis2));
      height += diamondPlateHeight(deckCoordinates) * detailVisibility(1.0 / 0.028, footprint);
      roughness = mix(roughness, 0.35, 0.5);
    }
  }

  // Splash zone just above the waterline (CDF z = 0 is sea level): marine growth at the bottom, then wet, dark steel,
  // with ragged edges.
  if (realisticSplashZone && modelHeight < 4.0) {
    float wet = 1.0 - smoothstep(0.0, 0.5, modelHeight - 2.6 * (0.55 + 0.7 * fbm(modelPosition, 0.45, footprint, 2)));
    float growth = 1.0 - smoothstep(0.0, 0.25, modelHeight - 0.8 * (0.4 + fbm(modelPosition + 9.0, 1.3, footprint, 2)));
    albedo *= mix(1.0, 0.42, wet);
    albedo = mix(albedo, vec3(0.045, 0.05, 0.025), growth * 0.85);
    roughness = mix(roughness, mix(0.22, 0.75, growth), wet);
  }

  // Rain: wet surfaces get darker and glossier, flat ones the most (puddles of water).
  float wet = smoothstep(0.55, 0.95, realisticOvercast);
  albedo *= mix(1.0, 0.7, wet);
  roughness = mix(roughness, roughness * (upFacing ? 0.2 : 0.45), wet);

  // Bump detail, in view-space units (model meters scaled by the model transformation).
  vec3 bumped = perturbNormal(viewNormal, viewPosition, height * modelScale);
  // Screen-space derivatives jump at silhouettes and primitive edges; ignore implausible perturbations there.
  vec3 n = dot(bumped, viewNormal) > 0.9 ? bumped : viewNormal;

  // Lighting (view space).
  vec3 v = normalize(-viewPosition);
  vec3 l = viewRotation * normalize(SUN_DIRECTION);
  vec3 up = viewRotation * vec3(0.0, 1.0, 0.0);
  vec3 h = normalize(l + v);
  float nDotL = max(dot(n, l), 0.0);
  float nDotV = max(dot(n, v), 1e-4);
  float nDotH = max(dot(n, h), 0.0);
  float vDotH = max(dot(v, h), 0.0);

  vec3 f0 = mix(vec3(0.04), albedo, metallic);
  float a = roughness * roughness;
  float a2 = a * a;
  float denom = nDotH * nDotH * (a2 - 1.0) + 1.0;
  float distribution = a2 / (REALISTIC_PI * denom * denom);
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float geometry = (nDotL / (nDotL * (1.0 - k) + k)) * (nDotV / (nDotV * (1.0 - k) + k));
  vec3 fresnel = f0 + (1.0 - f0) * pow(1.0 - vDotH, 5.0);
  vec3 specular = distribution * geometry * fresnel / max(4.0 * nDotL * nDotV, 1e-4);
  vec3 diffuse = (1.0 - fresnel) * (1.0 - metallic) * albedo / REALISTIC_PI;
  float sunlight = sunVisibility(worldPosition, normalize(transpose(viewRotation) * n), normalize(SUN_DIRECTION));
  // Drifting cloud shadows (model meters, ~6 m/s), and the sun fading behind the overcast.
  vec2 cloudPosition = vec2(dot(modelPosition, horizontalAxis1), dot(modelPosition, horizontalAxis2)) / 260.0 +
    vec2(1.0, 0.35) * realisticTime * 6.0 / 260.0;
  float cloudCover = smoothstep(0.6, 0.78, valueNoise(vec3(cloudPosition, 0.0)) * 0.7 + valueNoise(vec3(cloudPosition * 3.1, 5.0)) * 0.3);
  sunlight *= (1.0 - 0.8 * cloudCover) * (1.0 - 0.95 * smoothstep(0.0, 0.7, realisticOvercast));
  vec3 direct = (diffuse + specular) * SUN_COLOR * nDotL * sunlight;

  // Environment: sky/ground for diffuse, blurred sky reflection for specular.
  // Sky light (with some bounce light from below), boosted so surfaces facing away from the sun stay readable.
  vec3 irradiance;
  vec3 reflection;
  vec3 r = reflect(-v, n);
  if (realisticSkyEnabled) {
    vec3 worldN = transpose(viewRotation) * n;
    vec3 worldR = transpose(viewRotation) * r;
    // A heavily blurred mip approximates the irradiance from the sky; the sea and ground below give some bounce light.
    irradiance = 0.9 * mix(GROUND_COLOR * 1.5, skyTextureRadiance(vec3(worldN.x, max(worldN.y, 0.25), worldN.z), 9.0),
      smoothstep(-0.6, 0.4, worldN.y));
    reflection = skyTextureRadiance(worldR, roughness * 9.0);
  } else {
    irradiance = 0.85 * mix(GROUND_COLOR * 1.5, mix(SKY_HORIZON, SKY_ZENITH, 0.5), 0.5 + 0.5 * dot(n, up));
    reflection = mix(skyRadiance(r, up), irradiance, roughness);
  }
  vec3 ambientDiffuse = irradiance * albedo * (1.0 - metallic);
  vec3 ambientSpecular = reflection * environmentBrdf(f0, roughness, nDotV);

  vec3 color = direct + ambientDiffuse + ambientSpecular;
  // Aerial perspective (model meters, so it's the same at tabletop scale and life size): distant parts get hazy.
  if (realisticSkyEnabled) {
    float distance = length(viewPosition) / modelScale;
    vec3 worldView = transpose(viewRotation) * (-v);
    vec3 haze = skyTextureRadiance(normalize(vec3(worldView.x, 0.0, worldView.z)), 3.0) * 0.82;
    float visibility = mix(2500.0, 700.0, realisticOvercast);
    color = mix(color, haze, (1.0 - exp(-distance / visibility)) * mix(0.7, 0.9, realisticOvercast));
  }
  // Brighter exposure under the clouds, like a camera (or eyes) would adapt; it stays moody.
  return pow(acesTonemap(color * EXPOSURE * (1.0 + 0.6 * realisticOvercast)), vec3(1.0 / 2.2));
}

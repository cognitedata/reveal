precision highp float;
precision highp int;

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

uniform mat4 projectionMatrix;

uniform float spacing;
uniform float pcIndex;
uniform float screenWidth;
uniform float screenHeight;

out vec4 outputColor;

#ifdef highlight_point
	uniform vec4 highlightedPointColor;
#endif

in vec3 vColor;

#if defined(weighted_splats)
	in float vLinearDepth;
#endif

#if defined(use_edl)
	in float vLogDepth;
#endif

#if defined(paraboloid_point_shape)
        in vec3 vViewPosition;
#endif

#if defined(weighted_splats) || defined(paraboloid_point_shape)
	in float vRadius;
#endif

float specularStrength = 1.0;

void main() {

	vec3 color = vColor;
	float depth = gl_FragCoord.z;

	#if defined(circle_point_shape) || defined(paraboloid_point_shape) || defined (weighted_splats)
		float u = 2.0 * gl_PointCoord.x - 1.0;
		float v = 2.0 * gl_PointCoord.y - 1.0;
	#endif

	#if defined(circle_point_shape) || defined(paraboloid_point_shape)
		float cc = u*u + v*v;
		if(cc > 1.0){
			discard;
		}
	#endif

	#if defined color_type_point_index
		outputColor = vec4(color, pcIndex / 255.0);
	#else
		outputColor = vec4(color, 1.0);
	#endif

	#if defined paraboloid_point_shape
		float wi = 0.0 - ( u*u + v*v);
		vec4 pos = vec4(vViewPosition, 1.0);
		pos.z += wi * vRadius;
		float linearDepth = -pos.z;
		pos = projectionMatrix * pos;
		pos = pos / pos.w;
		float expDepth = pos.z;
		depth = (pos.z + 1.0) / 2.0;
		gl_FragDepth = depth;

		#if defined(color_type_depth)
			outputColor.r = linearDepth;
			outputColor.g = expDepth;
		#endif
	#endif

	#if defined(use_edl)
		// Note: potree library use different depth value for Paraboloid shape namely log2(linearDepth).
		outputColor.a = vLogDepth;
	#endif

	#if defined weighted_splats
		float distance = 2.0 * length(gl_PointCoord.xy - 0.5);
		float weight = max(0.0, 1.0 - distance);
		weight = pow(weight, 1.5);

		outputColor.a = weight;
		outputColor.rgb = outputColor.rgb * weight;

	#endif
}

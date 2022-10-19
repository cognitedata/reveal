precision highp float;
precision highp int;

#if defined paraboloid_point_shape
	#extension GL_EXT_frag_depth : enable
#endif

uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

uniform mat4 projectionMatrix;
uniform float opacity;

uniform float spacing;
uniform float pcIndex;
uniform float screenWidth;
uniform float screenHeight;

out vec4 outputColor;

#ifdef highlight_point
	uniform vec4 highlightedPointColor;
#endif

in vec3 vColor;

#if !defined(color_type_point_index)
	in float vOpacity;
#endif

#if defined(weighted_splats)
	in float vLinearDepth;
#endif

#if !defined(paraboloid_point_shape) && defined(use_edl)
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

	#if defined(circle_point_shape)
		float cc = u*u + v*v;
		if(cc > 1.0){
			discard;
		}
	#endif

	#if defined color_type_point_index
		outputColor = vec4(color, pcIndex / 255.0);
	#else
		outputColor = vec4(color, vOpacity);
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
		gl_FragDepthEXT = depth;

		#if defined(color_type_depth)
			outputColor.r = linearDepth;
			outputColor.g = expDepth;
		#endif

		#if defined(use_edl)
			outputColor.a = log2(linearDepth);
		#endif

	#else
		#if defined(use_edl)
			outputColor.a = vLogDepth;
		#endif
	#endif

	#if defined weighted_splats
		float distance = 2.0 * length(gl_PointCoord.xy - 0.5);
		float weight = max(0.0, 1.0 - distance);
		weight = pow(weight, 1.5);

		outputColor.a = weight;
		outputColor.rgb = outputColor.rgb * weight;

	#endif
}


#extension GL_EXT_frag_depth : enable

uniform sampler2D depthMap;
uniform sampler2D texture;

in vec2 vUv;

out vec4 outputColor

void main() {
    float depth = texture2D(depthMap, vUv).g;

	if(depth <= 0.0){
		discard;
	}

    vec4 color = texture2D(texture, vUv);
	color = color / color.w;

	outputColor = vec4(color.xyz, 1.0);

	gl_FragDepthEXT = depth;
}

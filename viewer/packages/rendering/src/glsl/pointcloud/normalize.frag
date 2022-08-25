precision highp float;

uniform sampler2D tDepth;
uniform sampler2D tDiffuse;

in vec2 vUv;

out vec4 outputColor;

void main() {
    float depth = texture(tDepth, vUv).r;

	if(depth >= 1.0){
		discard;
	}

    vec4 color = texture(tDiffuse, vUv);
	#if defined(points_blend) 
		color = color / color.w;
	#endif


	outputColor = vec4(color.xyz, 1.0);

	gl_FragDepth = depth;
}

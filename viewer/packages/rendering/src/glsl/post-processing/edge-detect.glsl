mat3 G[9];
// hard coded matrix values!!!! as suggested in https://github.com/neilmendoza/ofxPostProcessing/blob/master/src/EdgePass.cpp#L45
const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 );
const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 );
const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 );
const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 );
const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 );
const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 );
const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 );
const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 );
const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );

float edgeDetectionFilter(sampler2D baseTexture) {
  ivec2 fragCoord = ivec2(gl_FragCoord.xy);

	G[0] = g0,
	G[1] = g1,
	G[2] = g2,
	G[3] = g3,
	G[4] = g4,
	G[5] = g5,
	G[6] = g6,
	G[7] = g7,
	G[8] = g8;

	mat3 I;

	/* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
  I[0][0] = length(texelFetch(baseTexture, fragCoord + ivec2(-1, -1), 0).rgb);
  I[0][1] = length(texelFetch(baseTexture, fragCoord + ivec2(-1, 0), 0).rgb);
  I[0][2] = length(texelFetch(baseTexture, fragCoord + ivec2(-1, 1), 0).rgb);
  I[1][0] = length(texelFetch(baseTexture, fragCoord + ivec2(0, -1), 0).rgb);
  I[1][1] = length(texelFetch(baseTexture, fragCoord + ivec2(0, 0), 0).rgb);
  I[1][2] = length(texelFetch(baseTexture, fragCoord + ivec2(0, 1), 0).rgb);
  I[2][0] = length(texelFetch(baseTexture, fragCoord + ivec2(1, -1), 0).rgb);
  I[2][1] = length(texelFetch(baseTexture, fragCoord + ivec2(1, 0), 0).rgb);
  I[2][2] = length(texelFetch(baseTexture, fragCoord + ivec2(1, 1), 0).rgb);

  float dp0 = dot(G[0][0], I[0]) + dot(G[0][1], I[1]) + dot(G[0][2], I[2]);
  float cnv0 = dp0 * dp0;
  
  float dp1 = dot(G[1][0], I[0]) + dot(G[1][1], I[1]) + dot(G[1][2], I[2]);
  float cnv1 = dp1 * dp1;
  
  float dp2 = dot(G[2][0], I[0]) + dot(G[2][1], I[1]) + dot(G[2][2], I[2]);
  float cnv2 = dp2 * dp2;
  
  float dp3 = dot(G[3][0], I[0]) + dot(G[3][1], I[1]) + dot(G[3][2], I[2]);
  float cnv3 = dp3 * dp3;
  
  float dp4 = dot(G[4][0], I[0]) + dot(G[4][1], I[1]) + dot(G[4][2], I[2]);
  float cnv4 = dp4 * dp4;
  
  float dp5 = dot(G[5][0], I[0]) + dot(G[5][1], I[1]) + dot(G[5][2], I[2]);
  float cnv5 = dp5 * dp5;
  
  float dp6 = dot(G[6][0], I[0]) + dot(G[6][1], I[1]) + dot(G[6][2], I[2]);
  float cnv6 = dp6 * dp6;
  
  float dp7 = dot(G[7][0], I[0]) + dot(G[7][1], I[1]) + dot(G[7][2], I[2]);
  float cnv7 = dp7 * dp7;
  
  float dp8 = dot(G[8][0], I[0]) + dot(G[8][1], I[1]) + dot(G[8][2], I[2]);
  float cnv8 = dp8 * dp8;


	float M = (cnv0 + cnv1) + (cnv2 + cnv3);
	float S = (cnv4 + cnv5) + (cnv6 + cnv7) + (cnv8 + M);

  return sqrt(M/S);
}

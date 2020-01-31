/*!
 * Copyright 2020 Cognite AS
 */

// Based on https://github.com/godlikepanos/anki-3d-engine/blob/master/shaders/Pack.glsl
// Copyright (C) 2009-2020, Panagiotis Christopoulos Charitos and contributors.
// All rights reserved.
// Code licensed under the BSD License.
// http://www.anki3d.org/LICENSE
vec3 unpackRGToNormal(vec2 enc)
{
    float scale = 1.7777;
    vec2 nn = enc * (2.0 * scale) - scale;
    float g = 2.0 / (dot(nn.xy, nn.xy) + 1.0);
    vec3 normal;
    normal.xy = g * nn.xy;
    normal.z = g - 1.0;
    return normalize(normal);
}

#pragma glslify: rgb2hsv = require('../color/rgb2hsv.glsl')
#pragma glslify: hsv2rgb = require('../color/hsv2rgb.glsl')

#define KERNEL_SIZE 32

uniform sampler2D tDiffuse;
//uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform sampler2D tNoise;

uniform vec3 kernel[KERNEL_SIZE]; // TODO move size out

uniform vec2 resolution;

uniform float cameraNear;
uniform float cameraFar;
uniform mat4 cameraProjectionMatrix;
uniform mat4 cameraInverseProjectionMatrix;

uniform float kernelRadius;
uniform float minDistance;
uniform float maxDistance;

varying vec2 vUv;

#include <packing>

float getDepth( const in vec2 screenPosition ) {

    return texture2D( tDepth, screenPosition ).x;

}

float getLinearDepth( const in vec2 screenPosition ) {

//#if PERSPECTIVE_CAMERA == 1

    float fragCoordZ = texture2D( tDepth, screenPosition ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

//#else

    //return texture2D( depthSampler, coord ).x;

//#endif

}

float getViewZ( const in float depth ) {

//#if PERSPECTIVE_CAMERA == 1

    return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

//#else

    //return orthographicDepthToViewZ( depth, cameraNear, cameraFar );

//#endif
}

vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
    float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];

    vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );

    clipPosition *= clipW; // unprojection.

    return ( cameraInverseProjectionMatrix * clipPosition ).xyz;
}

vec3 getViewNormal( const in vec2 screenPosition ) {
    vec4 packedColorAndNormal = texture2D(tDiffuse, screenPosition);
    //vec3 normalHsv = vec3(packedColorAndNormal.z, 1.0, packedColorAndNormal.w);
    //vec3 normalRgb = hsv2rgb(normalHsv);
    //vec2 normalRg = vec2(packedColorAndNormal.r, packedColorAndNormal.g);
    //vec2 normalRg = vec2(packedColorAndNormal.b, packedColorAndNormal.a);
    //vec3 normal = unpackRGToNormal(normalRg);
    //return unpackRGBToNormal(normalRgb);
    vec3 normal = packedColorAndNormal.rgb;
    return normalize(normal);
}

void main() {
    float depth = getDepth( vUv );
    float viewZ = getViewZ( depth );

    vec3 viewPosition = getViewPosition( vUv, depth, viewZ );
    vec3 viewNormal = getViewNormal( vUv );

    vec2 noiseScale = vec2( resolution.x / 128.0, resolution.y / 128.0 );
    vec3 random = texture2D( tNoise, vUv * noiseScale ).xyz;
    //vec3 random = vec3(1, 0, 0);

    // compute matrix used to reorient a kernel vector

    vec3 tangent = normalize( random - viewNormal * dot( random, viewNormal ) );
    vec3 bitangent = cross( viewNormal, tangent );
    mat3 kernelMatrix = mat3( tangent, bitangent, viewNormal );

    float occlusion = 0.0;

    for ( int i = 0; i < KERNEL_SIZE; i ++ ) {
        vec3 sampleVector = kernelMatrix * kernel[ i ];
        vec3 samplePoint = viewPosition + sampleVector * kernelRadius;

        vec4 samplePointNDC = cameraProjectionMatrix * vec4( samplePoint, 1.0 );
        samplePointNDC /= samplePointNDC.w;

        vec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5;

        float realDepth = getLinearDepth( samplePointUv );
        float sampleDepth = viewZToOrthographicDepth( samplePoint.z, cameraNear, cameraFar );
        float delta = sampleDepth - realDepth;
        //float delta = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar) - realDepth;
        //float delta = realDepth - depth;

        if ( delta > minDistance && delta < maxDistance ) {
            occlusion += 1.0;
        }
    }

    // Subtract 0.5 here because at least 50 % of the points need to be behind to count as occlusion
    occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );

    gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );

}

#version 450

layout(location = 0) in vec3 a_Pos;
layout(location = 1) in vec3 a_Color;
//layout(location = 1) in vec2 a_TexCoord;
//layout(location = 2) in vec3 a_InstancePos;
//layout(location = 3) in vec3 a_InstanceSize;
//layout(location = 4) in vec3 a_InstanceColor;
//layout(location = 5) in vec4 a_InstanceMatrix1;
//layout(location = 6) in vec4 a_InstanceMatrix2;
//layout(location = 7) in vec4 a_InstanceMatrix3;
//layout(location = 8) in vec4 a_InstanceMatrix4;

layout(location = 0) out vec2 v_TexCoord;
layout(location = 1) out vec3 v_InstanceColor;

layout(set = 0, binding = 0) uniform Locals {
    mat4 u_Transform;
};

void main() {
    v_TexCoord = vec2(0,0);
    //v_InstanceColor = vec3(1, 0, 1);
    v_InstanceColor = a_Color;
    //mat4 instanceMatrix = mat4(a_InstanceMatrix1, a_InstanceMatrix2, a_InstanceMatrix3, a_InstanceMatrix4);
    //v_TexCoord = a_TexCoord;
    //v_InstanceColor = a_InstanceColor;
    //vec3 instanceSize = vec3(0.5, 1, 1);
    //vec3 pos = 0.5 * a_InstanceSize.xyz * a_Pos.xyz + a_InstancePos.xyz;
    //vec4 pos = instanceMatrix * a_Pos;

    vec4 pos = vec4(a_Pos, 1.0);

    //gl_Position = u_Transform * vec4(pos, 1.0);
    gl_Position = u_Transform * pos;
    // convert from -1,1 Z to 0,1
    //gl_Position.z = 0.5 * (gl_Position.z + gl_Position.w);
}

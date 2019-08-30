#version 450

layout(location = 0) in vec3 a_Pos;
layout(location = 1) in vec2 a_TexCoord;
layout(location = 2) in vec3 a_InstancePos;
layout(location = 3) in vec3 a_InstanceSize;
layout(location = 4) in vec3 a_InstanceColor;
layout(location = 5) in vec4 a_InstanceMatrix1;
layout(location = 6) in vec4 a_InstanceMatrix2;
layout(location = 7) in vec4 a_InstanceMatrix3;
layout(location = 8) in vec4 a_InstanceMatrix4;

layout(location = 0) out vec2 v_TexCoord;
layout(location = 1) out vec3 v_InstanceColor;

layout(set = 0, binding = 0) uniform Locals {
    mat4 u_Transform;
};

void main() {
    mat4 instanceMatrix = mat4(a_InstanceMatrix1, a_InstanceMatrix2, a_InstanceMatrix3, a_InstanceMatrix4);
    v_TexCoord = a_TexCoord;
    v_InstanceColor = a_InstanceColor;
    vec3 pos = a_Pos.xyz;
    gl_Position = u_Transform * instanceMatrix * vec4(pos, 1.0);
}

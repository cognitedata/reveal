#version 450

layout(location = 0) in vec3 a_Pos;
layout(location = 1) in vec4 a_InstanceMatrix1;
layout(location = 2) in vec4 a_InstanceMatrix2;
layout(location = 3) in vec4 a_InstanceMatrix3;
layout(location = 4) in vec4 a_InstanceMatrix4;
layout(location = 5) in vec3 a_Color;

layout(location = 0) out vec2 v_TexCoord;
layout(location = 1) out vec3 v_InstanceColor;

layout(set = 0, binding = 0) uniform Locals {
    mat4 u_Transform;
};

void main() {
    mat4 instanceMatrix = mat4(a_InstanceMatrix1, a_InstanceMatrix2, a_InstanceMatrix3, a_InstanceMatrix4);
    v_TexCoord = vec2(0.0, 0.0);
    //v_InstanceColor = vec3(1.0, 1.0, 0.0);
    v_InstanceColor = a_Color;
    //gl_Position = u_Transform * vec4(a_Pos, 1.0);
    gl_Position = u_Transform * instanceMatrix * vec4(a_Pos, 1.0);
}

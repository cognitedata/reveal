#version 450

layout(location = 0) in vec3 a_Pos;
layout(location = 1) in vec3 a_Color;

layout(location = 0) out vec2 v_TexCoord;
layout(location = 1) out vec3 v_InstanceColor;

layout(set = 0, binding = 0) uniform Locals {
    mat4 u_Transform;
};

void main() {
    v_TexCoord = vec2(0,0);
    v_InstanceColor = a_Color;
    vec4 pos = vec4(a_Pos, 1.0);
    gl_Position = u_Transform * pos;
}

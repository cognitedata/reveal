#version 450

layout(location = 0) in vec2 v_TexCoord;
layout(location = 1) in vec3 v_InstanceColor;

layout(location = 0) out vec4 o_Target;

layout(set = 0, binding = 1) uniform Locals {
    vec4 u_Color;
};

void main() {
    o_Target = vec4(v_InstanceColor, 1.0);
    //o_Target = u_Color;
}

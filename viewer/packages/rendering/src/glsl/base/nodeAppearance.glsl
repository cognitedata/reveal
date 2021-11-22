struct NodeAppearance {
  vec4 colorTexel;
  bool isVisible;
  bool renderInFront;
  bool renderGhosted;
};

#pragma glslify: export(NodeAppearance)

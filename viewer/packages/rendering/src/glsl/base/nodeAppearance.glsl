struct NodeAppearance {
  vec4 colorTexel;
  bool isVisible;
  bool renderInFront;
  bool renderGhosted;
  bool ignoreClipping;
};

#pragma glslify: export(NodeAppearance)

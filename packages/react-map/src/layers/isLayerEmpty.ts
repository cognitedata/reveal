export const isLayerEmpty = <T extends { disabled?: boolean }>(layer: T) => {
  return layer.disabled;
};

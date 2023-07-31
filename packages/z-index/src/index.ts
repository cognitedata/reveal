export function createLayers<LayerName extends string>(
  layers: readonly LayerName[],
  options: { base?: number; delta?: number } = {}
): Record<LayerName, number> {
  const { base = 100, delta = 10 } = options;
  const max = layers.length - 1;

  return layers.reduce(
    (acc, layer, i) => ({
      ...acc,
      [layer]: (max - i) * delta + base,
    }),
    {} as Record<LayerName, number>
  );
}

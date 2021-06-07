export function createLayers<Layer extends string>(
  layers: readonly string[],
  options: { base?: number; delta?: number } = {}
) {
  const { base = 100, delta = 10 } = options;

  type LayerLookup = {
    [key in Layer]: number;
  };

  const max = layers.length - 1;

  return layers.reduce(
    (acc, layer, i) => ({
      ...acc,
      [layer]: (max - i) * delta + base,
    }),
    {} as Partial<LayerLookup>
  ) as LayerLookup;
}

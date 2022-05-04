jest.mock('@cognite/reveal', () => {
  const { ...rest } = jest.requireActual('@cognite/reveal');
  function Cognite3DViewer() {
    return {
      on: jest.fn,
      fitCameraToModel: jest.fn,
      getIntersectionFromPixel: Promise.resolve(),
      addModel: () => Promise.resolve(),
    };
  }
  return { ...rest, Cognite3DViewer };
});

export {};

import { CasingLogNode } from 'SubSurface/Wells/Nodes/CasingLogNode';

const { BaseLogNode } = jest.requireActual(
  './SubSurface/Wells/Nodes/BaseLogNode'
);

jest.mock('./SubSurface/Wells/Nodes/DiscreteLogNode', () => {
  return {
    WebGLRenderer: jest.fn().mockReturnValue({
      domElement: document.createElement('div'), // create a fake div
      setSize: jest.fn(),
      render: jest.fn(),
    }),
  };
});

jest.mock('./SubSurface/Wells/Nodes/FloatLogNode', () => {
  return {
    WebGLRenderer: jest.fn().mockReturnValue({
      domElement: document.createElement('div'), // create a fake div
      setSize: jest.fn(),
      render: jest.fn(),
    }),
  };
});

jest.mock('./SubSurface/Wells/Nodes/PointLogNode', () => {
  return {
    PointLogNode: class TestLogNode {
      PointLogNode() {
        return new BaseLogNode();
      }
    },
  };
});

jest.mock('./SubSurface/Wells/Nodes/CasingLogNode', () => {
  return {
    CasingLogNode: class TestLogNode {
      CasingLogNode() {
        return new BaseLogNode() as CasingLogNode;
      }
    },
  };
});

export {};

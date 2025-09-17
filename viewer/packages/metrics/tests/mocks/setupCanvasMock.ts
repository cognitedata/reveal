import { jest } from '@jest/globals';

export function setupCanvasMock() {
  const mockCanvasContext = {
    fillRect: jest.fn(),
    fillText: jest.fn(),
    textBaseline: '', 
    font: '', 
    fillStyle: ''
  };
  const mockCanvas = {
    getContext: jest.fn().mockReturnValue(mockCanvasContext),
    toDataURL: jest.fn().mockReturnValue('mock-canvas-data-url'), 
  };
  
  global.document = {
    createElement: jest.fn(() => mockCanvas),
  } as unknown as Document;
}
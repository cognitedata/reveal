import { createContext, useContext } from 'react';

export const CanvasContext = createContext<{ height?: number; width?: number }>(
  {}
);

export const useCanvasSize = () => {
  return useContext(CanvasContext);
};

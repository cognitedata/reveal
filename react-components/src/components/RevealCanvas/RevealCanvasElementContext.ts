import { createContext, useContext } from 'react';

export const RevealCanvasElementContext = createContext<HTMLDivElement | null>(null);

export const useRevealContainerElement = (): HTMLDivElement => {
  const element = useContext(RevealCanvasElementContext);
  if (element === null) {
    throw new Error(
      'useRevealContainerElement must be used within a RevealContainerElementContextProvider'
    );
  }
  return element;
};

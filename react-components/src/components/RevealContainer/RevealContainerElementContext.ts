/*!
 * Copyright 2023 Cognite AS
 */

import { createContext, useContext } from 'react';

export const RevealContainerElementContext = createContext<HTMLDivElement | null>(null);

export const useRevealContainerElement = (): HTMLDivElement => {
  const element = useContext(RevealContainerElementContext);
  if (element === null) {
    throw new Error(
      'useRevealContainerElement must be used within a RevealContainerElementContextProvider'
    );
  }
  return element;
};

/*!
 * Copyright 2023 Cognite AS
 */

import React, { createContext, useContext, useState, useCallback, type JSX } from 'react';

export const AuxillaryDivProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [elements, setElements] = useState<JSX.Element[]>([]);

  // Maintain a local copy of the elements, needed for properly supporting multiple
  // `addElement` calls between rerenders
  let cachedElements = elements;

  const addElement = useCallback(
    (element: JSX.Element) => {
      const newElementList = [...cachedElements, element];

      setElements(newElementList);
      cachedElements = newElementList;
    },
    [elements, setElements]
  );

  const removeElement = useCallback(
    (element: JSX.Element) => {
      const newElementList = cachedElements.filter((e) => e !== element);

      setElements(newElementList);
      cachedElements = newElementList;
    },
    [elements, setElements]
  );

  return (
    <>
      <AuxillaryDivContext.Provider value={{ addElement, removeElement }}>
        <div>{elements}</div>
        {children}
      </AuxillaryDivContext.Provider>
    </>
  );
};

type AuxillaryContextData = {
  addElement: (element: JSX.Element) => void;
  removeElement: (element: JSX.Element) => void;
};

const AuxillaryDivContext = createContext<AuxillaryContextData | null>(null);

export const useAuxillaryDivContext = (): AuxillaryContextData => {
  const auxContext = useContext(AuxillaryDivContext);
  if (auxContext === null) {
    throw new Error('useAuxillaryDivContext must be used inside AuxillaryDivContext');
  }

  return auxContext;
};

/*!
 * Copyright 2023 Cognite AS
 */

import { createContext, useContext, useState, useCallback, type ReactElement } from 'react';

export const AuxillaryDivProvider = ({ children }: { children: ReactElement }): ReactElement => {
  const [elements, setElements] = useState<ReactElement[]>([]);

  // Maintain a local copy of the elements, needed for properly supporting multiple
  // `addElement` calls between rerenders
  let cachedElements = elements;

  const addElement = useCallback(
    (element: ReactElement) => {
      const newElementList = [...cachedElements, element];

      setElements(newElementList);
      cachedElements = newElementList;
    },
    [elements, setElements]
  );

  const removeElement = useCallback(
    (element: ReactElement) => {
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
  addElement: (element: ReactElement) => void;
  removeElement: (element: ReactElement) => void;
};

const AuxillaryDivContext = createContext<AuxillaryContextData | null>(null);

export const useAuxillaryDivContext = (): AuxillaryContextData => {
  const auxContext = useContext(AuxillaryDivContext);
  if (auxContext === null) {
    throw new Error('useAuxillaryDivContext must be used inside AuxillaryDivContext');
  }

  return auxContext;
};

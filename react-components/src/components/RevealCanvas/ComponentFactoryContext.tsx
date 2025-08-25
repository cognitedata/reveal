import { createContext, type ReactElement, type ReactNode, useContext, useMemo } from 'react';
import { type ComponentFactory } from '../Architecture/Factories/ComponentFactory';
import { createComponentFactory } from '../Architecture/Factories/createComponentFactory';

type ComponentFactoryContextContent = {
  value?: ComponentFactory;
};

export const ComponentFactoryContext = createContext<ComponentFactoryContextContent | undefined>(
  undefined
);

export const ComponentFactoryContextProvider = ({
  children
}: {
  children: ReactNode;
}): ReactElement => {
  const componentFactory = useMemo(() => createComponentFactory(), []);
  return (
    <ComponentFactoryContext.Provider value={{ value: componentFactory }}>
      {children}
    </ComponentFactoryContext.Provider>
  );
};

export const useComponentFactory = (): ComponentFactory => {
  const componentFactory = useContext(ComponentFactoryContext)?.value;
  if (componentFactory === undefined) {
    throw new Error('useComponentFactory must be used within a ComponentFactoryContextProvider');
  }
  return componentFactory;
};

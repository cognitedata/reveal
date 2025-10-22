import {
    Context,
  createContext,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useMemo
} from 'react';
import { type ComponentFactory } from '../Architecture/Factories/ComponentFactory';
import { createComponentFactory } from '../Architecture/Factories/createComponentFactory';

type ComponentFactoryContextContent = {
  componentFactory: ComponentFactory;
};

export const ComponentFactoryContext: Context<ComponentFactoryContextContent | undefined> = createContext<ComponentFactoryContextContent | undefined>(
  undefined
);

export const ComponentFactoryContextProvider = ({ children }: PropsWithChildren): ReactElement => {
  const componentFactory = useMemo(() => createComponentFactory(), []);
  return (
    <ComponentFactoryContext.Provider value={{ componentFactory }}>
      {children}
    </ComponentFactoryContext.Provider>
  );
};

export const useComponentFactory = (): ComponentFactory => {
  const componentFactory = useContext(ComponentFactoryContext)?.componentFactory;
  if (componentFactory === undefined) {
    throw new Error('useComponentFactory must be used within a ComponentFactoryContextProvider');
  }
  return componentFactory;
};

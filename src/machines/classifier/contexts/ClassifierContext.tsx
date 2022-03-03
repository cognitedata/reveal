import { useInterpret } from '@xstate/react';
import { Interpreter } from 'xstate';
import React, { createContext, FC, useContext } from 'react';
import { classifierMachine, Model } from '../classifierMachine';

export const ClassifierProvider = createContext<{
  classifierMachine?: Interpreter<Model>;
}>({});
export const useClassifierContext = (): {
  classifierMachine: Interpreter<Model>;
} => {
  const context = useContext(ClassifierProvider);

  if (context === undefined) {
    throw new Error('useClassifierContext: Missing provider wrapper');
  }

  return context as { classifierMachine: Interpreter<Model> };
};

export const ClassifierContext: FC = ({ children }) => {
  const classifierService = useInterpret(classifierMachine, { devTools: true });

  const value = React.useMemo(
    () => ({ classifierMachine: classifierService }),
    [classifierService]
  );

  return (
    <ClassifierProvider.Provider value={value}>
      {children}
    </ClassifierProvider.Provider>
  );
};

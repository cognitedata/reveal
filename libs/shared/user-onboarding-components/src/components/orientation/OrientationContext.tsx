import React, { createContext, useContext, useMemo, useState } from 'react';

import { OrientationContextInterface, OrientationState } from './types';

const OrientationContext = createContext<OrientationContextInterface>({
  state: { steps: [], open: false, complete: false },
  handleState: (state) => state,
});

/**
 *
 * The useOrientation hook is a custom hook that provides the walkthrough context.
 *
 */
export const useOrientation = () => {
  const context = useContext(OrientationContext);
  if (context === undefined) {
    throw new Error('useOrientation must be used within a OrientationProvider');
  }
  return context;
};

/**
 *
 * The walkthrough provider is a wrapper component that provides the walkthrough context to all children components.
 * It also provides the state and the handleState function to update the state.
 *
 */
export const OrientationProvider = ({ children }: React.PropsWithChildren) => {
  const [state, setState] = useState<OrientationState>({
    open: false,
    steps: [],
    enableHotspot: false,
    complete: false,
    nextButton: 'Next',
    lastStepButton: 'Got it',
    backButton: 'Back',
  });

  const walkthroughValue = useMemo(
    () => ({
      state,
      handleState: setState,
    }),
    [state, setState]
  );
  return (
    <OrientationContext.Provider value={walkthroughValue}>
      {children}
    </OrientationContext.Provider>
  );
};

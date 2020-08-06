import React, { useContext, useState, useCallback } from 'react';
import { RenderResourceActionsFunction } from 'types/Types';

export type ResourceActionsObserver = {
  add: (key: string, func: RenderResourceActionsFunction) => void;

  remove: (key: string) => void;

  run: (
    ...props: Parameters<RenderResourceActionsFunction>
  ) => React.ReactNode[];
};

const ResourceActionsContext = React.createContext(
  {} as ResourceActionsObserver
);

export const useResourceActionsContext = () => {
  const observer = useContext(ResourceActionsContext);
  return observer.run;
};

export const ResourceActionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [functions, setFunctions] = useState(
    {} as { [key: string]: RenderResourceActionsFunction | undefined }
  );

  const keys = Object.keys(functions);

  const run = useCallback(
    (...props: Parameters<RenderResourceActionsFunction>) => {
      return keys.reduce((prev, curr) => {
        if (functions[curr]) {
          return prev.concat(functions[curr]!(...props));
        }
        return prev;
      }, [] as React.ReactNode[]);
    },
    [functions, keys]
  );
  const remove = useCallback((key: string) => {
    setFunctions(funcs => ({ ...funcs, [key]: undefined }));
  }, []);
  const add = useCallback(
    (key: string, func: RenderResourceActionsFunction) => {
      setFunctions(funcs => ({ ...funcs, [key]: func }));
    },
    []
  );
  return (
    <ResourceActionsContext.Provider
      value={{
        add,
        remove,
        run,
      }}
    >
      {children}
    </ResourceActionsContext.Provider>
  );
};
export default ResourceActionsContext;

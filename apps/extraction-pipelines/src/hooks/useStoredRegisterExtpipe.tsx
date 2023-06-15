import React, { useContext, useState } from 'react';

import { RegisterExtpipeInfo } from '@extraction-pipelines/model/Extpipe';

interface ContextProps {
  storedExtpipe: Partial<RegisterExtpipeInfo>;
  setStoredExtpipe: React.Dispatch<
    React.SetStateAction<Partial<RegisterExtpipeInfo>>
  >;
}

const RegisterExtpipeContext = React.createContext<ContextProps | undefined>(
  undefined
);

interface RegisterExtpipeProviderProps {
  children: React.ReactNode;
  initExtpipe?: Partial<RegisterExtpipeInfo>;
}

const RegisterExtpipeProvider = ({
  initExtpipe,
  children,
}: RegisterExtpipeProviderProps): JSX.Element => {
  const [storedExtpipe, setStoredExtpipe] = useState<
    Partial<RegisterExtpipeInfo>
  >(initExtpipe ?? {});
  return (
    <RegisterExtpipeContext.Provider
      value={{ storedExtpipe, setStoredExtpipe }}
    >
      {children}
    </RegisterExtpipeContext.Provider>
  );
};

const useStoredRegisterExtpipe = () => {
  const context = useContext(RegisterExtpipeContext);
  if (context === undefined) {
    throw new Error(
      'You can not RegisterExtpipeContext context with out RegisterExtpipeProvider'
    );
  }
  return context;
};

export {
  RegisterExtpipeContext,
  RegisterExtpipeProvider,
  useStoredRegisterExtpipe,
};

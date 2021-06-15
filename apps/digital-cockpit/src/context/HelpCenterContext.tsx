import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react';

type Props = {
  children: React.ReactNode;
};

export type HelpCenterContextType = {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
};
const HelpCenterContext = createContext({} as HelpCenterContextType);

const HelpCenterContextProvider = ({ children }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  const { Provider } = HelpCenterContext;
  return (
    <Provider
      value={{
        isVisible,
        setIsVisible,
      }}
    >
      {children}
    </Provider>
  );
};

export { HelpCenterContext, HelpCenterContextProvider };

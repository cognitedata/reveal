import { useContext } from 'react';
import { HomePageContext, HomePageDispatchContext } from 'scarlet/contexts';

export const useHomePageState = () => useContext(HomePageContext);

export const useHomePageDispatch = () => useContext(HomePageDispatchContext);

export const useHomePageContext = () => {
  const homePageState = useHomePageState();
  const homePageDispatch = useHomePageDispatch();

  return {
    homePageState,
    homePageDispatch,
  };
};

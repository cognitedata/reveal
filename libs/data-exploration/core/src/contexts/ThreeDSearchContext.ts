import React, { useContext } from 'react';

export type ThreeDSearchContext = {
  resultIndex: number;
  setResultIndex: React.Dispatch<React.SetStateAction<number>>;
  pageLimit: number;
  setPageLimit: React.Dispatch<React.SetStateAction<number>>;
};
export const ThreeDSearchContext = React.createContext(
  {} as ThreeDSearchContext
);

export const useThreeDSearchContext = () => {
  return useContext(ThreeDSearchContext);
};

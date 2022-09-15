import useSelector from 'hooks/useSelector';

export const useGlobal = () => {
  return useSelector((state) => state.global);
};

export const useGlobalSidePanel = () => {
  return useSelector((state) => state.global.sidePanel);
};

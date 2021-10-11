import useSelector from 'hooks/useSelector';

export const useFilterDataNds = () => {
  return useSelector((state) => state.filterData.nds);
};

export const useFilterDataNpt = () => {
  return useSelector((state) => state.filterData.npt);
};

export const useFilterDataLog = () => {
  return useSelector((state) => state.filterData.log);
};

export const useFilterDataCasing = () => {
  return useSelector((state) => state.filterData.casing);
};

export const useFilterDataTrajectory = () => {
  return useSelector((state) => state.filterData.trajectory);
};

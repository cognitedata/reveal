import useSelector from 'hooks/useSelector';
// import { useSurveysCache } from './hooks';

export const useSeismic = () => {
  return useSelector((state) => state.seismicSearch);
};

export const useSeismicSurvey = (id: string) => {
  const { dataResult } = useSeismic();
  const matchingResult = dataResult.find((result) => result.survey === id);

  return matchingResult;
};

export const useSelectedSurveys = () => {
  const { selections } = useSeismic();
  return selections.surveys;
};

export const useSelectedFiles = () => {
  const { selections } = useSeismic();
  return selections.files;
};

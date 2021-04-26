import { useSelector } from 'react-redux';
import { RootState } from 'store';

export const useParsingJob = (workflowId: number) => {
  const parsingJob = useSelector(
    (state: RootState) =>
      state.contextualization.pnidParsing[workflowId] ?? { status: '' }
  );

  return parsingJob;
};

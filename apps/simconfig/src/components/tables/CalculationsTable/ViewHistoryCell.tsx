import { MouseEvent } from 'react';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch } from 'store/hooks';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { setSelectedCalculation } from 'store/file';

import { ViewRunHistoryButton } from './elements';

interface ComponentProps {
  data: FileInfoSerializable;
}
export default function ViewHistoryCell({ data }: ComponentProps) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const dispatch = useAppDispatch();

  const onClickViewHistory = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const { metadata, source, dataSetId, externalId } = data;
    if (!metadata || !source || !dataSetId || !externalId) {
      throw new Error('Insufficient calculation data');
    }
    const { calcName, modelName, calcType } = metadata;
    if (!calcName || !modelName || !calcType) {
      throw new Error('Insufficient calculation metadata');
    }
    dispatch(setSelectedCalculation(data));
    history.push(`${url}/run-history/${calcName}`);
  };

  return (
    <ViewRunHistoryButton
      aria-label="View history"
      type="ghost"
      icon="History"
      onClick={onClickViewHistory}
    />
  );
}

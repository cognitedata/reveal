import React, { FunctionComponent, PropsWithChildren } from 'react';
import InteractiveCopyWithText from 'components/InteractiveCopyWithText';
import { NO_DATA_SET_ID_SET } from 'utils/constants';
import { getDataSetsLink } from 'utils/dataSetUtils';
import { StyledLink } from 'styles/StyledLinks';
import { useAppEnv } from 'hooks/useAppEnv';
import { DataSetModel } from 'model/DataSetModel';

interface DataSetViewProps {
  dataSet?: DataSetModel;
  dataSetId?: number;
}
export const DATA_SET_ID_LABEL: Readonly<string> = 'Id';
export const DATA_SET_NAME_LABEL: Readonly<string> = 'Name';

export const DataSetView: FunctionComponent<DataSetViewProps> = ({
  dataSet,
  dataSetId,
}: PropsWithChildren<DataSetViewProps>) => {
  const { project, origin, cdfEnv } = useAppEnv();
  if (!dataSetId) {
    return <i>{NO_DATA_SET_ID_SET}</i>;
  }
  return (
    <>
      {dataSet && (
        <span className="text-normal">
          {DATA_SET_NAME_LABEL}:{' '}
          <StyledLink
            href={getDataSetsLink({ origin, project, cdfEnv, dataSetId })}
            target="_blank"
          >
            {dataSet.name}
          </StyledLink>
        </span>
      )}
      <span className="flex">
        {DATA_SET_ID_LABEL}:{' '}
        <InteractiveCopyWithText
          textToCopy={`${dataSetId}`}
          copyType="dataSetId"
        >
          {dataSetId}
        </InteractiveCopyWithText>
      </span>
    </>
  );
};

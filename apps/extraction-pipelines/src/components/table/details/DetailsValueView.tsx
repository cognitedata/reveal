import Schedule, {
  InteractiveCopyWrapper,
} from 'components/integrations/cols/Schedule';
import React from 'react';
import { DataSet } from '@cognite/sdk';
import { IntegrationFieldName, IntegrationFieldValue } from './DetailsCols';
import StatusMarker from '../../integrations/cols/StatusMarker';
import { Status } from '../../../model/Status';
import InteractiveCopy from '../../InteractiveCopy';
import DataSetDisplay from '../../integrations/cols/DataSet';
import DisplayEpocTime from '../../integrations/cols/DisplayEpocTime';

interface DetailsValueViewProps {
  fieldValue: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
}

const DetailsValueView = ({ fieldValue, fieldName }: DetailsValueViewProps) => {
  switch (fieldName) {
    case 'createdTime':
      return <DisplayEpocTime time={fieldValue as number} />;
    case 'schedule': {
      const val = (fieldValue as string) ?? undefined;
      return <Schedule schedule={val} />;
    }
    case 'dataSetId': {
      return (
        <>
          {fieldValue && (
            <DataSetDisplay
              dataSetId={`${fieldValue}`}
              dataSetName={`${fieldValue}`}
            />
          )}
        </>
      );
    }
    case 'dataSet': {
      const { name, id } = fieldValue as DataSet;
      return (
        <>
          {fieldValue && (
            <DataSetDisplay dataSetId={`${id}`} dataSetName={name ?? `${id}`} />
          )}
        </>
      );
    }
    case 'externalId':
      return (
        <InteractiveCopyWrapper>
          {fieldValue} <InteractiveCopy text={`${fieldValue}`} />
        </InteractiveCopyWrapper>
      );
    case 'lastSeen': {
      return <DisplayEpocTime time={fieldValue as number} />;
    }
    case 'status': {
      return <StatusMarker status={fieldValue as Status} />;
    }
    case 'latestRun': {
      return <DisplayEpocTime time={fieldValue as number} />;
    }
    case 'name':
    case 'description':
    case 'lastUpdatedTime':
    case 'lastSuccess':
    case 'lastFailure':
    case 'metadata':
    case 'owner':
    case 'authors':
      return <>{fieldValue}</>;
    default:
      return <>{fieldValue}</>;
  }
};

export default DetailsValueView;

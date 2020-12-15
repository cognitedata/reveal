import Schedule, {
  InteractiveCopyWrapper,
} from 'components/integrations/cols/Schedule';
import React from 'react';
import { DataSet } from '@cognite/sdk';
import StatusMarker from '../../integrations/cols/StatusMarker';
import { Status } from '../../../model/Status';
import InteractiveCopy from '../../InteractiveCopy';
import DataSetDisplay from '../../integrations/cols/DataSet';
import RelativeTimeWithTooltip from '../../integrations/cols/RelativeTimeWithTooltip';
import {
  IntegrationFieldName,
  IntegrationFieldValue,
} from '../../../model/Integration';

interface DetailsValueViewProps {
  fieldValue: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
}

const DetailsValueView = ({ fieldValue, fieldName }: DetailsValueViewProps) => {
  switch (fieldName) {
    case 'createdTime':
      return (
        <RelativeTimeWithTooltip id={fieldName} time={fieldValue as number} />
      );
    case 'schedule': {
      const val = (fieldValue as string) ?? undefined;
      return <Schedule id={fieldName} schedule={val} />;
    }
    case 'dataSetId': {
      return (
        <>
          {fieldValue && (
            <DataSetDisplay
              id={fieldName}
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
            <DataSetDisplay
              id={fieldName}
              dataSetId={`${id}`}
              dataSetName={name ?? `${id}`}
            />
          )}
        </>
      );
    }
    case 'externalId':
      return (
        <InteractiveCopyWrapper id={fieldName}>
          {fieldValue} <InteractiveCopy text={`${fieldValue}`} />
        </InteractiveCopyWrapper>
      );
    case 'lastSeen': {
      return (
        <RelativeTimeWithTooltip id={fieldName} time={fieldValue as number} />
      );
    }
    case 'status': {
      return <StatusMarker id={fieldName} status={fieldValue as Status} />;
    }
    case 'latestRun': {
      return (
        <RelativeTimeWithTooltip id={fieldName} time={fieldValue as number} />
      );
    }
    case 'name':
    case 'description':
    case 'lastUpdatedTime':
    case 'lastSuccess':
    case 'lastFailure':
    case 'metadata':
    case 'owner':
    case 'authors':
      return <span id={fieldName}>{fieldValue}</span>;
    default:
      return <span id={fieldName}>{fieldValue}</span>;
  }
};

export default DetailsValueView;

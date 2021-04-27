import Schedule, {
  InteractiveCopyWrapper,
} from 'components/integrations/cols/Schedule';
import React from 'react';
import { DataSet } from '@cognite/sdk';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import { Status } from 'model/Status';
import InteractiveCopy from 'components/InteractiveCopy';
import { DataSet as DataSetDisplay } from 'components/integrations/cols/DataSet';
import RelativeTimeWithTooltip from 'components/integrations/cols/RelativeTimeWithTooltip';
import {
  IntegrationFieldName,
  IntegrationFieldValue,
  IntegrationRawTable,
} from 'model/Integration';
import RawTable from 'components/integrations/cols/RawTable';
import EmailLink from 'components/buttons/EmailLink';

interface DetailsValueViewProps {
  fieldValue: IntegrationFieldValue;
  fieldName: IntegrationFieldName;
}

const DetailsValueView = ({ fieldValue, fieldName }: DetailsValueViewProps) => {
  switch (fieldName) {
    case 'lastUpdatedTime':
    case 'lastSeen':
    case 'createdTime':
    case 'latestRun':
      return (
        <RelativeTimeWithTooltip id={fieldName} time={fieldValue as number} />
      );
    case 'schedule': {
      const val = (fieldValue as string) ?? undefined;
      return <Schedule id={fieldName} schedule={val} />;
    }
    case 'dataSetId': {
      const val = (fieldValue as string) ?? undefined;
      return (
        <>
          <DataSetDisplay id={fieldName} dataSetId={val} dataSetName={val} />
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
    case 'rawTables': {
      return <RawTable rawTables={fieldValue as IntegrationRawTable[]} />;
    }
    case 'externalId':
      return (
        <InteractiveCopyWrapper id={fieldName}>
          {fieldValue}{' '}
          <InteractiveCopy text={`${fieldValue}`} copyType="externalId" />
        </InteractiveCopyWrapper>
      );
    case 'id':
      return (
        <InteractiveCopyWrapper id={fieldName}>
          {fieldValue} <InteractiveCopy text={`${fieldValue}`} copyType="id" />
        </InteractiveCopyWrapper>
      );
    case 'status': {
      return <StatusMarker id={fieldName} status={fieldValue as Status} />;
    }
    case 'createdBy': {
      return <>{fieldValue && <EmailLink email={fieldValue as string} />}</>;
    }
    case 'name':
    case 'lastSuccess':
    case 'lastFailure':
    case 'metadata':
    case 'description':
    case 'contacts':
      return <span id={fieldName}>{fieldValue}</span>;
    default:
      return <span id={fieldName}>{fieldValue}</span>;
  }
};

export default DetailsValueView;

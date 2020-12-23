import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Grid } from 'styles/grid/StyledGrid';
import { useIntegration } from '../../../hooks/details/IntegrationContext';
import NameView from '../NameView';
import { calculateStatus } from '../../../utils/integrationUtils';
import DescriptionView from '../DescriptionView';
import FieldView from '../FieldView';
import { TableHeadings } from '../../table/IntegrationTableCol';
import { DetailFieldNames } from '../../../model/Integration';

export const DetailsGrid = styled((props) => (
  <Grid {...props}>{props.children}</Grid>
))`
  .row-height-4 {
    min-height: 4rem;
  }
`;
interface OwnProps {}

type Props = OwnProps;

const MainDetails: FunctionComponent<Props> = () => {
  const {
    state: { integration },
  } = useIntegration();
  const latest = {
    lastSuccess: integration?.lastSuccess,
    lastFailure: integration?.lastFailure,
  };
  const status = calculateStatus(latest);

  return (
    <DetailsGrid role="grid">
      <NameView />
      <FieldView
        label={DetailFieldNames.EXTERNAL_ID}
        fieldName="externalId"
        fieldValue={integration?.externalId}
      />
      <DescriptionView />
      <FieldView
        label={DetailFieldNames.CREATED_TIME}
        fieldName="createdTime"
        fieldValue={integration?.createdTime}
      />
      <FieldView
        label={TableHeadings.STATUS}
        fieldName="status"
        fieldValue={status.status}
      />
      <FieldView
        label={TableHeadings.LATEST_RUN}
        fieldName="latestRun"
        fieldValue={status.time}
      />
      <FieldView
        label={TableHeadings.SCHEDULE}
        fieldName="schedule"
        fieldValue={integration?.schedule}
      />
      <FieldView
        label={TableHeadings.LAST_SEEN}
        fieldName="lastSeen"
        fieldValue={integration?.lastSeen}
      />
      <FieldView
        label={TableHeadings.DATA_SET}
        fieldName={integration?.dataSet ? 'dataSet' : 'dataSetId'}
        fieldValue={integration?.dataSet ?? integration?.dataSetId}
      />
      <FieldView
        label={DetailFieldNames.RAW_TABLE}
        fieldName="rawTables"
        fieldValue={integration?.rawTables}
      />
    </DetailsGrid>
  );
};

export default MainDetails;

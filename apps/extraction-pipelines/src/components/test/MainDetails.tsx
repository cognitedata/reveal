import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import NameView from '../form/NameView';
import {
  calculateStatus,
  DetailFieldNames,
} from '../../utils/integrationUtils';
import DescriptionView from '../form/DescriptionView';
import FieldView from '../form/FieldView';
import { TableHeadings } from '../table/IntegrationTableCol';
import { Grid } from './ContactsDetails';

export const DetailsGrid = styled((props) => (
  <Grid {...props}>{props.children}</Grid>
))`
  grid-column-gap: 0.4rem;
  .detail-row {
    &:hover {
      background-color: ${Colors['greyscale-grey3'].hex()};
    }
    &:nth-child(even) {
      background-color: ${Colors['greyscale-grey2'].hex()};
      &:hover {
        background-color: ${Colors['greyscale-grey3'].hex()};
      }
    }
    &:first-child {
      border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
    }
    border-bottom: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
  }
  form {
    min-height: 4rem;
    .cogs-detail,
    button {
      align-self: center;
      padding: 0.75rem;
    }
    .cogs-detail {
      padding: 0.75rem;
    }
  }
  .field-view {
    min-height: 4rem;
    label {
      padding: 0.75rem;
    }
    label,
    span {
      align-self: center;
    }
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
    <DetailsGrid>
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
    </DetailsGrid>
  );
};

export default MainDetails;

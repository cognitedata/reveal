import { Colors, Detail } from '@cognite/cogs.js';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import UserDetails from 'components/integrations/cols/UserDetails';
import DataSet from 'components/integrations/cols/DataSet';
import { Integration } from '../../model/Integration';
import { TimeDisplay } from '../TimeDisplay/TimeDisplay';
import ListMetaData from './ListMetaData';
import { TableHeadings } from '../table/IntegrationTableCol';

const StyledUl = styled.ul`
  margin: 1rem 0;
  padding: 0;
  list-style: none;
  li {
    padding: 0.7rem 0;
    border-bottom: 1px solid ${Colors['greyscale-grey2'].hex()};
    list-style: none;
    &:last-child {
      border-bottom: none;
    }
    &.details-data-set {
      display: flex;
    }
    ul {
      margin-top: 0.5rem;
      li {
        border: none;
      }
    }
  }
  .details-user {
    padding-left: 0;
    display: flex;
    li {
      margin-right: 1rem;
      border: none;
    }
  }
`;
interface OwnProps {
  integration: Integration;
}

type Props = OwnProps;

const Details: FunctionComponent<Props> = ({ integration }: Props) => {
  return (
    <StyledUl data-testid="view-integration-details-modal">
      <li key="details-name">
        <Detail strong>{TableHeadings.NAME}: </Detail>
        {integration.name}
      </li>
      <li key="details-id">
        <Detail strong>Id: </Detail> {integration.id}
      </li>
      <li key="details-external-id">
        <Detail strong>External Id: </Detail>
        {integration.externalId}
      </li>
      <li key="details-description">
        <Detail strong>Description: </Detail>
        {integration.description}
      </li>
      <li key="details-created-time">
        <Detail strong>Created Time: </Detail>
        <TimeDisplay value={integration.createdTime} relative withTooltip />
      </li>
      <li key="details-last-updated-time">
        <Detail strong>{TableHeadings.LAST_UPDATED}: </Detail>
        <TimeDisplay value={integration.lastUpdatedTime} relative withTooltip />
      </li>
      <li key="details-schedule">
        <Detail strong>{TableHeadings.SCHEDULE}: </Detail>
        {integration.schedule}
      </li>
      <li key="details-dataSetId" className="details-data-set">
        <Detail strong>{TableHeadings.DATA_SET}: </Detail>
        <DataSet
          dataSetId={integration.dataSetId}
          dataSetName={integration.dataSet?.name ?? integration.dataSetId}
        />
      </li>
      {integration.metadata && (
        <li key="details-metadata">
          <Detail strong>Meta Data: </Detail>
          <ListMetaData object={integration.metadata} />
        </li>
      )}
      <li key="details-owned-by">
        <Detail strong>{TableHeadings.OWNER}: </Detail>
        <UserDetails user={integration.owner} />
      </li>
      <li key="details-created-by">
        <Detail strong>{TableHeadings.CREATED_BY}: </Detail>
        <ul className="details-user">
          {integration.authors.map((author) => {
            return (
              <li key={`details-created-by-${author.email}`}>
                <UserDetails user={author} />
              </li>
            );
          })}
        </ul>
      </li>
    </StyledUl>
  );
};

export default Details;

import React from 'react';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
import { InfoGrid, InfoCell, SmallTitle, DetailsItem } from 'components/Common';
import { Sequence } from '@cognite/sdk';
import moment from 'moment';
import { SequenceInfoGrid } from './SequenceInfoGrid';

interface AssetDetailsProps {
  sequence: Sequence;
  actions?: React.ReactNode[];
  extras?: React.ReactNode;
  children?: React.ReactNode;
}

const IconWrapper = styled.span`
  background: #f5f5f5;
  padding: 5px;
  padding-bottom: 1px;
  border-radius: 4px;
  margin-right: 8px;
  vertical-align: -0.225em;
`;

export const SequenceDetailsAbstract = ({
  sequence,
  actions,
  extras,
  children,
}: AssetDetailsProps) => {
  return (
    <InfoGrid
      className="sequence-info-grid"
      noBorders
      style={{ flexDirection: 'column' }}
    >
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {sequence.name && (
        <InfoCell
          containerStyles={{ paddingTop: 0, paddingBottom: 0 }}
          noBorders
        >
          <SmallTitle style={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper>
              <Icon type="GridFilled" />
            </IconWrapper>
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {sequence.name}
            </span>
          </SmallTitle>
        </InfoCell>
      )}

      {actions && (
        <InfoCell noBorders>
          <div className="button-row">{actions}</div>
        </InfoCell>
      )}
      <SequenceInfoGrid
        sequence={sequence}
        additionalRows={[
          <DetailsItem
            key="description"
            name="Description"
            value={sequence.description}
          />,
          <DetailsItem
            key="createdTime"
            name="Created at"
            value={moment(sequence.createdTime).format('MM/DD/YYYY HH:MM')}
          />,
          <DetailsItem
            key="lastUpdatedTime"
            name="Updated at"
            value={moment(sequence.lastUpdatedTime).format('MM/DD/YYYY HH:MM')}
          />,
          <DetailsItem
            key="externalId"
            name="External ID"
            value={sequence.externalId}
          />,
        ]}
      />
      {children}
    </InfoGrid>
  );
};

SequenceDetailsAbstract.SequenceInfoGrid = SequenceInfoGrid;

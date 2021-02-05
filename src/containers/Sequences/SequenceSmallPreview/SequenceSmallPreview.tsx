import React from 'react';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Sequence } from '@cognite/sdk';
import {
  ErrorFeedback,
  Loader,
  InfoGrid,
  InfoCell,
  SpacedRow,
  ResourceIcons,
} from 'components';
import { Title, Body, Colors } from '@cognite/cogs.js';
import { SmallPreviewProps, SelectableItemProps } from 'CommonProps';
import { SequenceDetails } from 'containers/Sequences';
import { useSelectionButton } from 'hooks/useSelection';

export const SequenceSmallPreview = ({
  sequenceId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = () => {},
}: {
  sequenceId: number;
} & SmallPreviewProps &
  Partial<SelectableItemProps>) => {
  const { data: sequences = [], isFetched, error } = useCdfItems<Sequence>(
    'sequences',
    [{ id: sequenceId }]
  );

  const sequence = isFetched && sequences[0];

  const selectionButton = useSelectionButton(
    selectionMode,
    { type: 'sequence', id: sequenceId },
    isSelected,
    onSelect
  );

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!sequence) {
    return <>Sequence {sequenceId} not found!</>;
  }

  return (
    <InfoGrid
      className="sequence-info-grid"
      noBorders
      style={{ flexDirection: 'column' }}
    >
      {statusText && (
        <InfoCell
          noBorders
          containerStyles={{
            display: 'flex',
            alignItems: 'center',
            color: Colors['greyscale-grey6'].hex(),
          }}
        >
          <Body
            level={2}
            strong
            style={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            {statusText}
          </Body>
        </InfoCell>
      )}
      {extras && (
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {extras}
        </div>
      )}
      {sequence.name && (
        <InfoCell noBorders noPadding>
          <Title level={5} style={{ display: 'flex', alignItems: 'center' }}>
            <ResourceIcons.Sequence />
            <span
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {sequence.name}
            </span>
          </Title>
        </InfoCell>
      )}

      <InfoCell noBorders>
        <SpacedRow>
          {selectionButton}
          {actions}
        </SpacedRow>
      </InfoCell>
      <SequenceDetails sequence={sequence} />
      {children}
    </InfoGrid>
  );
};

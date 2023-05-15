import { Loader } from '@data-exploration/components';
import React from 'react';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { CogniteError, Sequence } from '@cognite/sdk';
import {
  ErrorFeedback,
  InfoGrid,
  InfoCell,
  SpacedRow,
  ResourceIcons,
} from '@data-exploration-components/components';
import { Title, Body } from '@cognite/cogs.js';
import {
  SmallPreviewProps,
  SelectableItemProps,
} from '@data-exploration-components/types';
import { SequenceDetails } from '@data-exploration-components/containers/Sequences';
import { useSelectionButton } from '@data-exploration-components/hooks/useSelection';
import noop from 'lodash/noop';

export const SequenceSmallPreview = ({
  sequenceId,
  actions,
  extras,
  children,
  statusText,
  selectionMode = 'none',
  isSelected = false,
  onSelect = noop,
  hideTitle = false,
}: {
  sequenceId: number;
} & SmallPreviewProps &
  Partial<SelectableItemProps>) => {
  const {
    data: sequences = [],
    isFetched,
    error,
  } = useCdfItems<Sequence>('sequences', [{ id: sequenceId }]);

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
    return <ErrorFeedback error={error as CogniteError} />;
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
            color: 'var(--cogs-text-icon--medium)',
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
      {!hideTitle && sequence.name && (
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

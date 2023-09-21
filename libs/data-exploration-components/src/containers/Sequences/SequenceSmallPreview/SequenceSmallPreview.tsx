import React from 'react';

import { Loader } from '@data-exploration/components';
import { SequenceInfo } from '@data-exploration/containers';
import noop from 'lodash/noop';

import { Title, Body } from '@cognite/cogs.js';
import { CogniteError, Sequence } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import {
  ErrorFeedback,
  InfoCell,
  InfoGrid,
  ResourceIcons,
  SpacedRow,
} from '../../../components';
import { useSelectionButton } from '../../../hooks';
import { SelectableItemProps, SmallPreviewProps } from '../../../types';

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
      <SequenceInfo sequence={sequence} />
      {children}
    </InfoGrid>
  );
};

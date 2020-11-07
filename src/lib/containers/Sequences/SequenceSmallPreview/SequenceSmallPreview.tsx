import React, { useMemo } from 'react';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Sequence } from '@cognite/sdk';
import {
  ErrorFeedback,
  Loader,
  InfoGrid,
  InfoCell,
  SpacedRow,
  ResourceIcons,
} from 'lib/components';
import { useResourceActionsContext } from 'lib/context';
import { useSelectionButton } from 'lib/hooks/useSelection';
import { Title, Body, Colors } from '@cognite/cogs.js';
import { SmallPreviewProps } from 'lib/CommonProps';
import { SequenceDetails } from 'lib/containers/Sequences';

export const SequenceSmallPreview = ({
  sequenceId,
  actions: propActions,
  extras,
  children,
  statusText,
}: {
  sequenceId: number;
} & SmallPreviewProps) => {
  const { data: sequences = [], isFetched, error } = useCdfItems<Sequence>(
    'sequences',
    [{ id: sequenceId }]
  );

  const sequence = isFetched && sequences[0];

  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'sequence',
    id: sequenceId,
  });

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [selectionButton];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: sequenceId,
        type: 'sequence',
      })
    );
    return items;
  }, [selectionButton, renderResourceActions, sequenceId, propActions]);

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

      {actions && (
        <InfoCell noBorders>
          <SpacedRow>{actions}</SpacedRow>
        </InfoCell>
      )}
      <SequenceDetails sequence={sequence} />
      {children}
    </InfoGrid>
  );
};

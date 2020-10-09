import React, { useMemo } from 'react';
import {
  ErrorFeedback,
  SequenceDetailsAbstract,
  Loader,
} from 'components/Common';

import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';
import { useCdfItems } from 'hooks/sdk';
import { Sequence } from '@cognite/sdk';

export const SequenceSmallPreview = ({
  sequenceId,
  actions: propActions,
  extras,
  children,
}: {
  sequenceId: number;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
}) => {
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
    <SequenceDetailsAbstract
      key={sequence.id}
      sequence={sequence}
      extras={extras}
      actions={actions}
    >
      {children}
    </SequenceDetailsAbstract>
  );
};

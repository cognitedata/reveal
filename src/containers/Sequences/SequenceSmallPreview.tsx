import React, { useEffect, useMemo } from 'react';
import { SequenceDetailsAbstract, Loader } from 'components/Common';
import { useDispatch, useSelector } from 'react-redux';
import { itemSelector, retrieve } from 'modules/sequences';
import { useResourceActionsContext } from 'context/ResourceActionsContext';

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
  const renderResourceActions = useResourceActionsContext();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(retrieve([{ id: sequenceId }]));
  }, [dispatch, sequenceId]);

  const sequence = useSelector(itemSelector)(sequenceId);
  const actions = useMemo(() => {
    const items: React.ReactNode[] = [];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        sequenceId,
      })
    );
    return items;
  }, [renderResourceActions, sequenceId, propActions]);

  if (!sequence) {
    return <Loader />;
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

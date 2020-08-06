import React, { useEffect } from 'react';
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
  const actions: React.ReactNode[] = [];
  actions.push(...(propActions || []));
  actions.push(
    ...renderResourceActions({
      sequenceId,
    })
  );

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

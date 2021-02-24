import React from 'react';
import { Sequence } from '@cognite/sdk';
import { SequenceDetailsAbstract } from 'components/Common';
import { useDispatch } from 'react-redux';
import { Button } from '@cognite/cogs.js';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';

export const SequenceHoverPreview = ({
  sequence,
  actions,
  extras,
  disableSidebarToggle = false,
}: {
  sequence: Sequence;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  disableSidebarToggle?: boolean;
}) => {
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <SequenceDetailsAbstract
      key={sequence.id}
      sequence={sequence}
      extras={extras}
      actions={
        disableSidebarToggle
          ? actions
          : [
              <Button
                icon="Expand"
                key="open"
                onClick={() =>
                  dispatch(
                    onResourceSelected(
                      {
                        sequenceId: sequence.id,
                        showSidebar: true,
                      },
                      history
                    )
                  )
                }
              >
                View
              </Button>,
              ...(actions || []),
            ]
      }
    />
  );
};

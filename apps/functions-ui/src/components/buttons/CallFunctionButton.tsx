import React, { useState } from 'react';

import CallFunctionModal from '@functions-ui/components/FunctionModals/CallFunctionModal';
import { useFunction } from '@functions-ui/utils/hooks';

import { Button, Tooltip } from '@cognite/cogs.js';

type Props = {
  id: number;
};

export default function CallFunctionButton({ id }: Props) {
  const { data: fn } = useFunction(id);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Tooltip placement="top" content="Click to call the function">
        <Button
          icon="Triangle"
          size="small"
          style={{
            justifyContent: 'center',
            rotate: '90deg',
          }}
          disabled={fn?.status !== 'Ready'}
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
        />
      </Tooltip>
      {showModal ? (
        <CallFunctionModal id={id} closeModal={() => setShowModal(false)} />
      ) : null}
    </>
  );
}

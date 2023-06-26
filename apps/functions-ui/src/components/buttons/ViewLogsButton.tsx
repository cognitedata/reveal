import React, { useState } from 'react';

import FunctionLogsModal from '@functions-ui/components/FunctionModals/FunctionLogsModal';

import { Button } from '@cognite/cogs.js';

type Props = {
  id: number;
  callId: number;
};

export default function ViewLogsButton({ id, callId }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        style={{
          justifyContent: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        View logs
      </Button>
      {showModal ? (
        <FunctionLogsModal
          id={id}
          callId={callId}
          onCancel={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

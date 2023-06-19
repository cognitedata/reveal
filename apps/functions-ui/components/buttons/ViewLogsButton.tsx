import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import FunctionLogsModal from 'components/FunctionModals/FunctionLogsModal';

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
        onClick={e => {
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

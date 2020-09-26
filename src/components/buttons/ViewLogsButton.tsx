import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import ViewLogsModal from 'components/FunctionModals/ViewLogsModal';

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
        View Logs
      </Button>
      {showModal ? (
        <ViewLogsModal
          id={id}
          callId={callId}
          onCancel={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

import React, { useState } from 'react';

import FunctionCallResponseModal from '@functions-ui/components/FunctionModals/FunctionCallResponseModal';

import { Button } from '@cognite/cogs.js';

type Props = {
  id: number;
  callId: number;
};

export default function ViewResponseButton({ id, callId }: Props) {
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
        View response
      </Button>
      {showModal ? (
        <FunctionCallResponseModal
          id={id}
          callId={callId}
          onCancel={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

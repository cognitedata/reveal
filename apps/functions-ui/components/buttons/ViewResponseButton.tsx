import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import FunctionCallResponseModal from 'components/FunctionModals/FunctionCallResponseModal';

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
        onClick={e => {
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

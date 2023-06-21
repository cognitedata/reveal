import React, { useState } from 'react';

import UploadFunctionModal from '@functions-ui/components/FunctionModals/UploadFunctionModal';

import { Button } from '@cognite/cogs.js';

export default function UploadFunctionButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        type="primary"
        style={{
          justifyContent: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        Upload function
      </Button>
      {showModal ? (
        <UploadFunctionModal onCancel={() => setShowModal(false)} />
      ) : null}
    </>
  );
}

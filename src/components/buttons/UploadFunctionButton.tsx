import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import UploadFunctionModal from 'components/FunctionModals/UploadFunctionModal';

export default function UploadFunctionButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        type="primary"
        style={{
          justifyContent: 'center',
        }}
        onClick={e => {
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

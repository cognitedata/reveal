import React, { useState } from 'react';

import UploadFunctionModal from '@functions-ui/components/FunctionModals/UploadFunctionModal';
import { useLimits } from '@functions-ui/utils/hooks';

import { Button } from '@cognite/cogs.js';

export default function UploadFunctionButton() {
  const [showModal, setShowModal] = useState(false);
  const { data: limits, isFetched } = useLimits();
  return (
    <>
      <Button
        disabled={!isFetched}
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
        <UploadFunctionModal
          onCancel={() => setShowModal(false)}
          limits={limits}
        />
      ) : null}
    </>
  );
}

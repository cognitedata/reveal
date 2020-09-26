import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import CreateFunctionModal from 'components/FunctionModals/CreateFunctionModal';

export default function CreateFunctionButton() {
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
        Create Schedule
      </Button>
      {showModal ? (
        <CreateFunctionModalo
          onCancel={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

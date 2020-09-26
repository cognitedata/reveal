import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import CreateScheduleModal from 'components/FunctionModals/CreateScheduleModal';

type Props = {
  externalId: string;
};

export default function CreateScheduleButton({ externalId }: Props) {
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
        <CreateScheduleModal
          externalId={externalId}
          onCancel={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

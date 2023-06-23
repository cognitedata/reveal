import React, { useState } from 'react';

import CreateScheduleModal from '@functions-ui/components/FunctionModals/CreateScheduleModal';

import { Button } from '@cognite/cogs.js';

type Props = {
  id: number;
  externalId?: string;
};

export default function CreateScheduleButton({ id, externalId }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        type="primary"
        style={{
          justifyContent: 'center',
          marginBottom: 8,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        Create Schedule
      </Button>
      {showModal ? (
        <CreateScheduleModal
          id={id}
          externalId={externalId}
          onCancel={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

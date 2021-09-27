import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import CreateScheduleModal from 'components/FunctionModals/CreateScheduleModal';

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
          id={id}
          externalId={externalId}
          onCancel={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

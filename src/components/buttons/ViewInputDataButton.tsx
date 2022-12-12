import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import ScheduleInputDataModal from '../FunctionModals/ScheduleInputDataModal';

type Props = {
  id: number;
};

export default function ViewInputDataButton({ id }: Props) {
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
        View input
      </Button>
      {showModal ? (
        <ScheduleInputDataModal id={id} onCancel={() => setShowModal(false)} />
      ) : null}
    </>
  );
}

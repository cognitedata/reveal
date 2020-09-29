import React, { useState } from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';

import CallFunctionModal from 'components/FunctionModals/CallFunctionModal';
import { useFunction } from 'utils/hooks';

type Props = {
  id: number;
};

export default function CallFunctionButton({ id }: Props) {
  const { data: fn } = useFunction(id);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Tooltip placement="top" content="Click to call the function">
        <Button
          icon="TriangleRight"
          size="small"
          style={{
            justifyContent: 'center',
          }}
          disabled={fn?.status !== 'Ready'}
          onClick={e => {
            e.stopPropagation();
            setShowModal(true);
          }}
        />
      </Tooltip>
      {showModal ? (
        <CallFunctionModal id={id} closeModal={() => setShowModal(false)} />
      ) : null}
    </>
  );
}

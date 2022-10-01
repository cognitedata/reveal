import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import type { DragControls } from 'framer-motion';

interface CollapseOptionsProps {
  controls: DragControls;
  handleDelete: () => void;
}

export function CollapseOptions({
  controls,
  handleDelete,
}: CollapseOptionsProps) {
  return (
    <CollapseOptionsContainer>
      <Icon
        className="step-dnd"
        type="DragHandleVertical"
        onPointerDown={(e) => {
          controls.start(e);
        }}
      />
      <Icon
        className="step-delete"
        type="Delete"
        onClick={() => {
          handleDelete();
        }}
      />
    </CollapseOptionsContainer>
  );
}

const CollapseOptionsContainer = styled.div`
  .step-dnd {
    cursor: move;
  }
  .step-delete {
    cursor: pointer;
  }
`;

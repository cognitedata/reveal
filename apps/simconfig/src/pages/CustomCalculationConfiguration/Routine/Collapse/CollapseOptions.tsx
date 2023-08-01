import type { DragControls } from 'framer-motion';

import { Button } from '@cognite/cogs.js';

interface CollapseOptionsProps {
  controls: DragControls;
  handleDelete: () => void;
}

export function CollapseOptions({
  controls,
  handleDelete,
}: CollapseOptionsProps) {
  return (
    <div>
      <Button
        aria-label="Drag to reorder"
        icon="DragHandleVertical"
        style={{ cursor: 'move' }}
        type="ghost"
        onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
          controls.start(e);
        }}
      />
      <Button
        aria-label="Delete"
        icon="Delete"
        type="ghost"
        onClick={() => {
          handleDelete();
        }}
      />
    </div>
  );
}

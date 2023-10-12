import type { DragControls } from 'framer-motion';

import { Button } from '@cognite/cogs.js';

interface CollapseOptionsProps {
  controls: DragControls;
  handleDelete: () => void;
  label: string;
}

export function CollapseOptions({
  controls,
  handleDelete,
  label,
}: CollapseOptionsProps) {
  return (
    <div>
      <Button
        aria-label={`Drag to reorder ${label}`}
        icon="DragHandleVertical"
        style={{ cursor: 'move' }}
        type="ghost"
        onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
          controls.start(e);
        }}
      />
      <Button
        aria-label={`Delete ${label}`}
        icon="Delete"
        type="ghost"
        onClick={() => {
          handleDelete();
        }}
      />
    </div>
  );
}

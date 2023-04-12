import { Button, Input, Title, Tooltip } from '@cognite/cogs.js';
import { useState, useEffect } from 'react';
import { UseIndustryCanvasManagerReturnType } from '../hooks/useIndustryCanvasService';
import { DEFAULT_CANVAS_NAME } from '../services/IndustryCanvasService';

type CanvasTitleProps = Pick<
  UseIndustryCanvasManagerReturnType,
  'activeCanvas' | 'saveCanvas'
>;

export const CanvasTitle: React.FC<CanvasTitleProps> = ({
  activeCanvas,
  saveCanvas,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activeCanvas?.name ?? DEFAULT_CANVAS_NAME);

  useEffect(() => {
    setName(activeCanvas?.name ?? '');
  }, [activeCanvas]);

  const onEditCanvasName = async () => {
    if (isEditing && activeCanvas !== undefined) {
      await saveCanvas({ ...activeCanvas, name });
      setIsEditing(false);
      return;
    }
    setIsEditing(true);
  };

  return (
    <Title level={3}>
      {isEditing ? (
        <Input onChange={(e) => setName(e.target.value)} value={name} />
      ) : (
        <span>{name}</span>
      )}
      {activeCanvas !== undefined && (
        <Tooltip content="Edit canvas name">
          <Button
            icon={isEditing ? 'Checkmark' : 'Edit'}
            aria-label="edit-canvas-name"
            onClick={onEditCanvasName}
            disabled={activeCanvas === undefined}
            size="small"
            style={{ marginLeft: 8 }}
            type="ghost"
          />
        </Tooltip>
      )}
    </Title>
  );
};

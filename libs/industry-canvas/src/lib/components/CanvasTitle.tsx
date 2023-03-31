import { Button, Input, Title, Tooltip } from '@cognite/cogs.js';
import { useState, useEffect } from 'react';
import { useIndustryCanvasService } from '../hooks/useIndustryCanvasService';
import { DEFAULT_CANVAS_NAME } from '../services/IndustryCanvasService';

export const CanvasTitle: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { activeCanvas, saveCanvas } = useIndustryCanvasService();
  const [name, setName] = useState(activeCanvas?.name ?? DEFAULT_CANVAS_NAME);

  useEffect(() => {
    if (activeCanvas !== undefined) {
      setName(activeCanvas.name);
    }
  }, [activeCanvas]);

  if (activeCanvas === undefined) {
    return null;
  }

  const onEditCanvasName = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    await saveCanvas({ ...activeCanvas, name });
    setIsEditing(false);
  };

  return (
    <Title level={3}>
      {isEditing ? (
        <Input onChange={(e) => setName(e.target.value)} value={name} />
      ) : (
        <span>{activeCanvas.name}</span>
      )}

      <Tooltip content="Edit canvas name">
        <Button
          icon={isEditing ? 'Checkmark' : 'Edit'}
          aria-label="edit-canvas-name"
          onClick={onEditCanvasName}
          size="small"
          style={{ marginLeft: 8 }}
          type="ghost"
        />
      </Tooltip>
    </Title>
  );
};

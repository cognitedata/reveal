import { Button } from '@cognite/cogs.js';

import { ControlProps } from './types';

export const DeleteControl: React.FC<ControlProps> = ({ nodes, instance }) => {
  const handleClick = () => {
    nodes.forEach((node) => {
      node.destroy();
    });
    instance.transformer.setSelectedNodes([]);
    instance.emitSaveEvent();
  };
  return <Button type="ghost-danger" icon="Delete" onClick={handleClick} />;
};

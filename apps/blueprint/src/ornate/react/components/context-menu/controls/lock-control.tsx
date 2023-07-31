import { Button } from '@cognite/cogs.js';
import { useEffect, useState } from 'react';

import { ControlProps } from './types';

export const LockControl: React.FC<ControlProps> = ({ nodes, instance }) => {
  const [isLocked, setIsLocked] = useState(nodes[0].attrs.locked);

  useEffect(() => {
    setIsLocked(nodes[0].attrs.locked);
  }, [nodes]);

  const handleClick = () => {
    nodes.forEach((n) => {
      n.setAttr('locked', !isLocked);
    });
    setIsLocked(!isLocked);

    instance.emitSaveEvent();
  };
  return (
    <Button
      type="ghost"
      icon={isLocked ? 'Lock' : 'Unlock'}
      onClick={handleClick}
    />
  );
};

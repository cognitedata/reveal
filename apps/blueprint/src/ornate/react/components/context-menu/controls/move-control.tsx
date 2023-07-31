import { Button } from '@cognite/cogs.js';

import { ControlProps } from './types';

export const MoveControl: React.FC<ControlProps> = ({ instance, nodes }) => {
  const handleUp = () => {
    nodes.forEach((node) => {
      node.moveToTop();
    });
    instance.emitSaveEvent();
  };
  const handleDown = () => {
    nodes.forEach((node) => {
      node.moveToBottom();
    });
    instance.emitSaveEvent();
  };
  return (
    <>
      <Button type="ghost" icon="ChevronUp" onClick={handleUp} />
      <Button type="ghost" icon="ChevronDown" onClick={handleDown} />
    </>
  );
};

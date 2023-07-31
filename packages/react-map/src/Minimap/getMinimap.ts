import { Minimap } from './Minimap';

export const getMinimap = ({
  disabled,
  style,
}: {
  disabled?: boolean;
  style: string;
}) => {
  const miniMap = disabled ? undefined : new Minimap({ style });

  return miniMap;
};

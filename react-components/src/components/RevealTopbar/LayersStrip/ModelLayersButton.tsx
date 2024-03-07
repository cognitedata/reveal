import { Button, Dropdown, IconType, Tooltip } from '@cognite/cogs.js';
import { useReveal } from '../../..';
import { ModelHandler } from './ModelHandler';
import { ModelLayersList } from './ModelLayersList';

export const ModelLayersButton = ({
  icon,
  label,
  handlers,
  update
}: {
  icon: IconType;
  label: string;
  handlers: ModelHandler[];
  update: () => void;
}) => {
  const viewer = useReveal();

  return (
    <Tooltip content={label} placement="right" appendTo={document.body}>
      <Dropdown
        appendTo={viewer.domElement ?? document.body}
        content={<ModelLayersList modelHandlers={handlers} update={update} label={label} />}>
        <Button type="ghost" icon={icon} />
      </Dropdown>
    </Tooltip>
  );
};

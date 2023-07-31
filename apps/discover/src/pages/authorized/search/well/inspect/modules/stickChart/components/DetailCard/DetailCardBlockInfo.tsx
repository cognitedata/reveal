import { Icon, Tooltip } from '@cognite/cogs.js';

export const DetailCardBlockInfo: React.FC<{
  info: string;
}> = ({ info }) => {
  return (
    <Tooltip placement="right" content={info}>
      <Icon type="Info" data-testid="info-icon" />
    </Tooltip>
  );
};

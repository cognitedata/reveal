import { Tooltip, Icon, Flex } from '@cognite/cogs.js';

export const InfoTooltip = ({ content }: { content: string }) => {
  return (
    <Flex alignItems="center">
      <Tooltip content={content}>
        <Icon type="Info" />
      </Tooltip>
    </Flex>
  );
};

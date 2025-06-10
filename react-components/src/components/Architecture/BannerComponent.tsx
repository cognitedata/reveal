import { type BaseBannerCommand } from '../../architecture/base/commands/BaseBannerCommand';
import { type ReactNode } from 'react';
import styled from 'styled-components';
import { Infobox } from '@cognite/cogs.js';
import { useCommandProperty } from './useCommandProperty';
import { useCommand } from './useCommand';
import { useCommandVisible } from './useCommandProps';
import { translate } from '../../architecture/base/utilities/translateUtils';

export const BannerComponent = ({
  command: inputCommand
}: {
  command: BaseBannerCommand;
}): ReactNode => {
  const command = useCommand(inputCommand);
  const isVisible = useCommandVisible(command);
  const content = useCommandProperty(command, () => command.content);
  const status = useCommandProperty(command, () => command.status);
  if (!isVisible) {
    return null;
  }

  return <StyledInfobox status={status}>{translate(content)}</StyledInfobox>;
};

const StyledInfobox = styled(Infobox)`
  display: flex;
  padding: 8px 12px;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

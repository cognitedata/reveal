import { type TranslateDelegate } from '../../architecture';
import { type BaseBannerCommand } from '../../architecture/base/commands/BaseBannerCommand';
import { type ReactNode } from 'react';
import styled from 'styled-components';
import { Infobox } from '@cognite/cogs.js';
import { useProperty } from './useProperty';
import { useCommand } from './useCommand';

export const BannerComponent = ({
  command: inputCommand,
  t
}: {
  command: BaseBannerCommand;
  t: TranslateDelegate;
}): ReactNode => {
  const command = useCommand(inputCommand);
  const isVisible = useProperty(command, () => command.isVisible);
  const content = useProperty(command, () => command.content);
  const status = useProperty(command, () => command.status);
  if (!isVisible) {
    return null;
  }
  return <StyledInfobox status={status}>{t(content)}</StyledInfobox>;
};

const StyledInfobox = styled(Infobox)`
  display: flex;
  padding: 8px 12px;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

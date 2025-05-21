import { type TranslateDelegate } from '../../architecture';
import { type BaseBannerCommand } from '../../architecture/base/commands/BaseBannerCommand';
import { type ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { Infobox } from '@cognite/cogs.js';
import { getDefaultCommand } from './utilities';
import { useRenderTarget } from '../RevealCanvas';
import { useProperty } from './useProperty';

export const BannerComponent = ({
  command: inputCommand,
  t
}: {
  command: BaseBannerCommand;
  t: TranslateDelegate;
}): ReactNode => {
  const renderTarget = useRenderTarget();
  const command = useMemo<BaseBannerCommand>(
    () => getDefaultCommand<BaseBannerCommand>(inputCommand, renderTarget),
    []
  );

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

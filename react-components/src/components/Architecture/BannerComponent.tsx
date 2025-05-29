import { type TranslationInput } from '../../architecture';
import {
  type BannerStatus,
  type BaseBannerCommand
} from '../../architecture/base/commands/BaseBannerCommand';
import { useOnUpdate } from './useOnUpdate';
import { type ReactNode, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Infobox } from '@cognite/cogs.js';
import { getDefaultCommand } from './utilities';
import { useRenderTarget } from '../RevealCanvas';
import { translate } from '../../architecture/base/utilities/translateUtils';

export const BannerComponent = ({
  command: inputCommand
}: {
  command: BaseBannerCommand;
}): ReactNode => {
  const renderTarget = useRenderTarget();
  const command = useMemo<BaseBannerCommand>(
    () => getDefaultCommand<BaseBannerCommand>(inputCommand, renderTarget),
    []
  );

  const [visible, setVisible] = useState<boolean>(command.isVisible);
  const [content, setContent] = useState<TranslationInput>(command.content);
  const [status, setStatus] = useState<BannerStatus>(command.status);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
    setContent(command.content);
    setStatus(command.status);
  });

  if (!visible) {
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

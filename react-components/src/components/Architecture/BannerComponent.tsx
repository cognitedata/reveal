import { Banner } from '@cognite/cogs-lab';
import { TranslateDelegate, TranslationInput } from '../../architecture';
import {
  BannerStatus,
  BaseBannerCommand
} from '../../architecture/base/commands/BaseBannerCommand';
import { useOnUpdate } from './useOnUpdate';
import { useState } from 'react';
import { IconName } from '../../architecture/base/utilities/IconName';
import styled from 'styled-components';
import { Infobox } from '@cognite/cogs.js';

export const BannerComponent = ({
  inputCommand,
  translationDelegate
}: {
  inputCommand: BaseBannerCommand;
  translationDelegate: TranslateDelegate;
}) => {
  const [visible, setVisible] = useState<boolean>(inputCommand.isVisible);
  const [content, setContent] = useState<TranslationInput>(inputCommand.content);
  const [status, setStatus] = useState<BannerStatus>(inputCommand.status);

  useOnUpdate(inputCommand, () => {
    setVisible(inputCommand.isVisible);
    setContent(inputCommand.content);
    setStatus(inputCommand.status);
  });

  if (!visible) {
    return null;
  }

  return <StyledInfobox status={status}>{translationDelegate(content)}</StyledInfobox>;
};

const StyledInfobox = styled(Infobox)`
  display: flex;
  min-width: 200px;
  padding: var(--Container-padding-top, 8px) var(--Container-padding-left-right, 12px);
  align-items: flex-start;
  gap: var(--Container-horizontal-gap, 8px);
  align-self: stretch;
`;

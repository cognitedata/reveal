/* eslint-disable @cognite/no-number-z-index */
import React from 'react';

import styled from 'styled-components';

import copy from 'copy-to-clipboard';

import { Button, Colors } from '@cognite/cogs.js';

import { useTranslation } from '../../../i18n';
import { trackUsage } from '../../utils/metrics';

type Props = {
  textToCopy: string;
  label: string;
};

export function CopyButton({ textToCopy, label }: Props) {
  const [didCopy, setDidCopy] = React.useState(false);
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    trackUsage({ e: 'data.catalog.search.resource.copy.id.click' });
    copy(textToCopy);
    setDidCopy(true);
    setTimeout(() => {
      setDidCopy(false);
    }, 1500);
  };

  return (
    <StyledButton icon="Copy" onClick={handleClick} type="ghost">
      {didCopy ? t('copied') : label}
    </StyledButton>
  );
}

const StyledButton = styled(Button)`
  z-index: 1;
  white-space: nowrap;
  height: 28px;
  background: ${Colors['decorative--grayscale--white']};
  border: 1px solid ${Colors['border--muted']};
  border-radius: 4px;
  width: fit-content;
  & svg {
    min-width: 16px;
  }
`;

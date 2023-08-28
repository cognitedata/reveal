import React, { useState } from 'react';

import { useTranslations } from '@charts-app/hooks/translations';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import styled from 'styled-components/macro';

import { Tooltip, Button } from '@cognite/cogs.js';
import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';

const defaultTranslations = makeDefaultTranslations(
  'Find your data here to get started creating your chart.',
  'Got it'
);

type Props = {
  onHide: () => void;
};

const TooltipContent = ({ onHide }: Props) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'SearchTooltip').t,
  };
  return (
    <Contents>
      <TooltipText>
        {t['Find your data here to get started creating your chart.']}
      </TooltipText>
      <TooltipActions>
        <Button onClick={onHide} type="primary">
          {t['Got it']}
        </Button>
      </TooltipActions>
    </Contents>
  );
};

const localStorageKey = 'searchTooltipShown';

const SearchTooltip = ({ children }: React.PropsWithChildren<any>) => {
  const isShown = getFromLocalStorage(localStorageKey, true);
  const [visible, setVisible] = useState(isShown);
  if (!isShown) {
    return children;
  }
  return (
    <Tooltip
      interactive
      visible={visible}
      content={
        <TooltipContent
          onHide={() => {
            setVisible(false);
            saveToLocalStorage(localStorageKey, false);
          }}
        />
      }
      position="right"
      elevated
    >
      {children}
    </Tooltip>
  );
};

export default SearchTooltip;

const Contents = styled.div`
  width: 400px;
  padding: 5pt;
  zindex: 10000;
`;

const TooltipText = styled.div`
  margin-bottom: 10pt;
`;

const TooltipActions = styled.div`
  display: flex;
  justify-content: right;
`;

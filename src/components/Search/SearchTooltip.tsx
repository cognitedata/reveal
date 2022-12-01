import React, { useState } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';
import { Tooltip, Button } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { makeDefaultTranslations } from 'utils/translations';

const defaultTranslations = makeDefaultTranslations(
  'Find your data here to get started creating your chart.',
  'Got it'
);

type Props = {
  onHide: () => void;
  translations?: typeof defaultTranslations;
};

const TooltipContent = ({ onHide, translations }: Props) => {
  const t = { ...defaultTranslations, ...translations };
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

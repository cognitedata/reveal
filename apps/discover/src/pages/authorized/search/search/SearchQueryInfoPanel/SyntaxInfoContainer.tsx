import { useState, useEffect } from 'react';

import isNil from 'lodash/isNil';

import { storage } from '@cognite/storage';

import { SYNTAX_INFO_CONTAINER_KEY } from './constants';
import {
  SyntaxInfoCloseButton,
  SyntaxRuleInfoContainer,
  SyntaxRuleInfoTitle,
} from './elements';

export const SyntaxInfoContainer: React.FC = () => {
  const storageValue = storage.getFromLocalStorage<boolean>(
    SYNTAX_INFO_CONTAINER_KEY
  );

  const [showInfoContainer, setShowInfoContainer] = useState(storageValue);

  useEffect(() => {
    if (isNil(storageValue)) {
      setShowInfoContainer(true);
      return;
    }
    setShowInfoContainer(storageValue);
  }, [storageValue]);

  const handleClose = () => {
    storage.saveToLocalStorage(SYNTAX_INFO_CONTAINER_KEY, false);
    setShowInfoContainer(false);
  };

  if (!showInfoContainer) {
    return null;
  }

  return (
    <SyntaxRuleInfoContainer data-testid="syntax-rule-info-container">
      <SyntaxRuleInfoTitle>
        Syntax applies only to document search
      </SyntaxRuleInfoTitle>
      <SyntaxInfoCloseButton onClick={handleClose} />
    </SyntaxRuleInfoContainer>
  );
};

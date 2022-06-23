import React from 'react';
import { useHistory } from 'react-router-dom';

import { CloseButton } from 'components/Buttons';
import { useTranslation } from 'hooks/useTranslation';
import { FlexGrow } from 'styles/layout';

import { StandaloneHeaderWrapper, StandaloneHeaderTitle } from './elements';

export interface Props {
  title: string;
  hidden?: boolean;
}

export const StandaloneHeader: React.FC<Props> = ({
  title,
  hidden = false,
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  if (hidden) return null;

  return (
    <StandaloneHeaderWrapper>
      <StandaloneHeaderTitle>{t(title)}</StandaloneHeaderTitle>
      <FlexGrow />
      <CloseButton
        onClick={() => history.goBack()}
        data-testid="standalone-header-close-btn"
      />
    </StandaloneHeaderWrapper>
  );
};

export default StandaloneHeader;

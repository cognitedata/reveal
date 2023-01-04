import * as React from 'react';
import { useHistory } from 'react-router-dom-v5';

import { CloseButton } from 'components/Buttons';
import { useTranslation } from 'hooks/useTranslation';
import { FlexGrow } from 'styles/layout';

import { StandaloneHeaderWrapper, StandaloneHeaderTitle } from './elements';

export interface Props {
  title: string;
  hidden?: boolean;
  additionalActionComponent?: React.ReactElement;
}

export const StandaloneHeader: React.FC<Props> = ({
  title,
  hidden = false,
  additionalActionComponent,
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  if (hidden) {
    return null;
  }

  return (
    <StandaloneHeaderWrapper>
      <StandaloneHeaderTitle>{t(title)}</StandaloneHeaderTitle>
      <FlexGrow />
      {additionalActionComponent}
      <CloseButton
        onClick={() => history.goBack()}
        data-testid="standalone-header-close-btn"
      />
    </StandaloneHeaderWrapper>
  );
};

export default StandaloneHeader;

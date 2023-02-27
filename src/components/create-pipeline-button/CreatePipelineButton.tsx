import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import { Link, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

export const CreatePipelineButton = (): JSX.Element => {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  return (
    <>
      <Link to={createLink(`/${subAppPath}/create`)}>
        <StyledButton type="primary" icon="AddLarge">
          {t('create-pipeline')}
        </StyledButton>
      </Link>
    </>
  );
};

const StyledButton = styled(Button)`
  white-space: nowrap;
`;

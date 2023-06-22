import React from 'react';

import styled from 'styled-components';

import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { useExtpipeConfig } from '../../hooks/config';
import { EXTRACTION_PIPELINES_PATH } from '../../utils/baseURL';

import CreatedTime from './CreatedTime';

type Props = { externalId: string; revision: number };

export const ConfigurationHeading = ({ externalId, revision }: Props) => {
  const { t } = useTranslation();
  const { data: configuration } = useExtpipeConfig({
    externalId,
    revision,
  });
  const created =
    !!configuration?.createdTime && new Date(configuration?.createdTime);
  return (
    <StyledHeadingContainer>
      <SecondaryTopbar
        goBackFallback={createLink(`/${EXTRACTION_PIPELINES_PATH}`)}
        extraContent={
          created && (
            <div>
              <CreatedTime prefix={t('configuration-created')} date={created} />
            </div>
          )
        }
        title={t('configuration')}
      />
    </StyledHeadingContainer>
  );
};

const StyledHeadingContainer = styled.div`
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;

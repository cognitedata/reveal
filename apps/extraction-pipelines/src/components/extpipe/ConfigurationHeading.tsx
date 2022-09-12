import React from 'react';
import { Colors, Flex, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

import { PAGE_MARGIN, StyledNavLink } from 'components/styled';
import { createExtPipePath } from 'utils/baseURL';
import { useTranslation } from 'common';
import { useSelectedExtpipeId } from 'hooks/useExtpipe';
import { EXT_PIPE_PATH, HEALTH_PATH } from 'routing/RoutingConfig';
import { useExtpipeConfig } from 'hooks/config';
import CreatedTime from './CreatedTime';

type Props = { externalId: string; revision: number };
export const ConfigurationHeading = ({ externalId, revision }: Props) => {
  const { t } = useTranslation();
  const id = useSelectedExtpipeId();
  const { data: configuration } = useExtpipeConfig({
    externalId,
    revision,
  });
  const created =
    !!configuration?.createdTime && new Date(configuration?.createdTime);
  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{
          padding: `1rem ${PAGE_MARGIN}`,
          borderBottom: `1px solid ${Colors['greyscale-grey5'].hex()}`,
          backgroundColor: 'white',
        }}
      >
        <Flex alignItems="center">
          <StyledNavLink
            to={{
              pathname: createExtPipePath(
                `/${EXT_PIPE_PATH}/${id}/${HEALTH_PATH}`
              ),
            }}
          >
            <LeftArrowContainer>
              <Icon type="ArrowLeft" />
            </LeftArrowContainer>
          </StyledNavLink>
          <StyledTitle>{t('configuration')}</StyledTitle>
        </Flex>
        {created && (
          <div>
            <CreatedTime prefix={t('configuration-created')} date={created} />
          </div>
        )}
      </Flex>
    </>
  );
};

const LeftArrowContainer = styled.div`
  align-items: center;
  display: flex;
  margin-right: 5px;
`;

const StyledTitle = styled(Title)`
  &.cogs-title-1 {
    font-size: 1.5rem;
    line-height: normal;
    margin: 0;
  }
`;

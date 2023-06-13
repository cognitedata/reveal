import { ReactNode } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@data-catalog-app/common/i18n';
import { trackUsage } from '@data-catalog-app/utils';

import { createLink } from '@cognite/cdf-utilities';
import { Title, Flex, Link } from '@cognite/cogs.js';

export type PageProps = {
  children: ReactNode;
  className?: string;
  title: string;
};

const Page = ({ children, className, title }: PageProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <StyledPage className={className}>
      <StyledTitleContainer justifyContent="space-between" alignItems="center">
        <Title level={3}>{title}</Title>
        <span
          role="button"
          onClick={() => trackUsage({ e: 'data.explore.navigate' })}
        >
          <Link href={createLink('/explore')} target="_blank">
            {t('explore-data')}
          </Link>
        </span>
      </StyledTitleContainer>
      <StyledPageContent>{children}</StyledPageContent>
    </StyledPage>
  );
};

const StyledPage = styled.div`
  padding-top: 24px;
  padding-bottom: 24px;
`;
const StyledTitleContainer = styled(Flex)`
  padding-left: 40px;
  padding-right: 40px;
`;
const StyledPageContent = styled.div`
  padding-left: 40px;
  padding-right: 40px;
  margin-top: 40px;
`;

export default Page;

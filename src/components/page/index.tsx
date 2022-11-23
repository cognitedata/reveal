import { ReactNode } from 'react';
import styled from 'styled-components';
import { Icon, Title, Flex, Colors, Body } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';
import { useTranslation } from 'common/i18n';
import { createLink } from '@cognite/cdf-utilities';
import { trackUsage } from 'utils';

export type PageProps = {
  children: ReactNode;
  className?: string;
  title: string;
};

const Page = ({ children, className, title }: PageProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <StyledPage className={className}>
      <Flex
        style={{ paddingBottom: 32, paddingLeft: 40, paddingRight: 40 }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Title level={3}>{title}</Title>
        <Link
          to={createLink('/explore')}
          target="_blank"
          onClick={() => trackUsage({ e: 'data.explore.navigate' })}
        >
          <Flex alignItems="center" gap={8}>
            <StyledLinkText level={5}>{t('explore-link')}</StyledLinkText>
            <Icon type="ExternalLink" />
          </Flex>
        </Link>
      </Flex>
      <Divider />
      <StyledPageContent>{children}</StyledPageContent>
    </StyledPage>
  );
};

const StyledPage = styled.div`
  padding-top: 24px;
  padding-bottom: 24px;
`;
const StyledPageContent = styled.div`
  padding-left: 40px;
  padding-right: 40px;
  margin-top: 40px;
`;

const Divider = styled.div`
  border-bottom: 1px solid ${Colors['border--muted']};
`;

const StyledLinkText = styled(Body)`
  font-size: 16px;
  color: ${Colors['text-icon--interactive--default']};
`;

export default Page;

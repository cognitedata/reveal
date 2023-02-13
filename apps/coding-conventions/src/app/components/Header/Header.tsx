import { createLink } from '@cognite/cdf-utilities';
import {
  Body,
  Breadcrumbs as CogsBreadcrumb,
  Input,
  Title as CogsTitle,
} from '@cognite/cogs.js';
import styled from 'styled-components';

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: { title: string; link?: string }[];
}

export const Header: React.FC<Props> = ({ title, subtitle, breadcrumbs }) => {
  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item title="Home" link={createLink('/')} />
        {breadcrumbs?.map((item) => (
          <Breadcrumb.Item
            key={item.title}
            title={item.title}
            link={item.link || ''}
          />
        ))}
      </Breadcrumb>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Container>
  );
};

const Container = styled.section`
  height: 160px;
  background: var(--cogs-surface--status-neutral--muted--default);
  padding: 24px 156px;
`;

const Title = styled(CogsTitle).attrs({ level: 2 })`
  margin-top: 16px !important;
`;

const Subtitle = styled(Body)`
  padding-top: 4px;
`;

const Breadcrumb = styled(CogsBreadcrumb)`
  padding: 0;
`;

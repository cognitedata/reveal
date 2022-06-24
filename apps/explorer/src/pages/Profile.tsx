import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { PAGES } from './routers/constants';

export const PageWrapper = styled.div``;
export const PageHeader = styled.div``;
export const PageContent = styled.div``;

export const Profile = () => {
  return (
    <PageWrapper>
      <PageHeader>
        <Link to={PAGES.HOME}>Back</Link>
      </PageHeader>
      <PageContent>
        <div>Profile Pages</div>
      </PageContent>
    </PageWrapper>
  );
};

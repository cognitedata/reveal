import React, { FunctionComponent, useEffect } from 'react';
import { useParams } from 'react-router';
import { Colors, Loader } from '@cognite/cogs.js';
import {
  NavLink,
  Route,
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';
import { Integration } from 'model/Integration';
import { IdEither } from '@cognite/sdk';
import { ContactsView } from 'components/integration/ContactsView';
import { useIntegrationById } from '../../hooks/useIntegration';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';
import { StyledRouterLink } from '../../components/integrations/cols/Name';
import { INTEGRATIONS } from '../../utils/baseURL';
import { useAppEnv } from '../../hooks/useAppEnv';
import InteractiveCopyWithText from '../../components/InteractiveCopyWithText';
import {
  IntegrationView,
  Wrapper,
} from '../../components/integration/IntegrationView';
import { PageTitle } from '../../styles/StyledHeadings';
import { PageWrapper } from '../../styles/StyledPage';
import { useDataSets } from '../../hooks/useDataSets';
import { RouterParams } from '../../routing/RoutingConfig';
import { RunLogsView } from '../../components/integration/RunLogsView';
import { CONTACTS, DETAILS, RUNS } from '../../utils/constants';

const IntegrationPageWrapper = styled((props) => (
  <PageWrapper {...props}>{props.children}</PageWrapper>
))`
  grid-template-areas:
    'breadcrumbs breadcrumbs'
    'title links'
    'main main';
  h1 {
    margin: 0.5rem 0 1.5rem 2rem;
  }
  #integrations-overview-link {
    grid-area: breadcrumbs;
    margin: 0.5rem 0 0.5rem 2rem;
  }
  span[aria-expanded] {
    align-self: center;
    justify-self: flex-end;
    > #copy-link-this-page {
      grid-area: links;
      justify-self: end;
      margin-right: 2rem;
      display: flex;
      align-items: center;
    }
  }
`;
const SingleIntegrationGrid = styled.div`
  grid-area: main;
  display: grid;
  grid-template-columns: auto;
  padding: 0;
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;

const PageNav = styled.ul`
  margin: 0;
  padding: 1rem 0 0.5rem 0;
  list-style: none;
  display: flex;
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  li {
    margin: 0;
    padding: 0;
    &:first-child {
      margin: 0 0 0 1rem;
    }
    .tab-link {
      padding: 0.75rem 1rem;
      margin: 0 1rem;
      color: ${Colors.black.hex()};
      font-weight: bold;
      &:hover {
        background-color: ${Colors['midblue-7'].hex()};
      }
      &.active {
        border-bottom: 3px solid ${Colors.primary.hex()};
      }
    }
  }
`;

interface IntegrationPageProps {}

const IntegrationPage: FunctionComponent<IntegrationPageProps> = () => {
  const { pathname, search } = useLocation();
  const { path, url } = useRouteMatch();
  const { cdfEnv, project, origin } = useAppEnv();
  const { id } = useParams<RouterParams>();
  const { integration, setIntegration } = useSelectedIntegration();
  const int = useIntegrationById(id);
  const dataSetId: IdEither[] = int.data?.dataSetId
    ? [{ id: parseInt(int.data.dataSetId, 10) }]
    : [];
  const dataset = useDataSets(dataSetId);
  useEffect(() => {
    if (int.data || dataset.data) {
      const res: Integration = {
        ...int.data,
        ...(dataset.data && { dataSet: dataset.data[0] }),
      } as Integration;
      setIntegration(res);
    }
  }, [int.data, dataset.data, setIntegration]);
  if (int.isLoading || dataset.isLoading) {
    return <Loader />;
  }

  return (
    <IntegrationPageWrapper>
      <StyledRouterLink
        id="integrations-overview-link"
        to={{
          pathname: `/${project}/${INTEGRATIONS}`,
          search: cdfEnv ? `?env=${cdfEnv}` : '',
        }}
      >
        Integrations overview
      </StyledRouterLink>
      <PageTitle>{integration?.name}</PageTitle>
      <InteractiveCopyWithText
        id="copy-link-this-page"
        textToCopy={`${origin}${pathname}${search}`}
      >
        <>Copy link to this page</>
      </InteractiveCopyWithText>
      <SingleIntegrationGrid>
        <PageNav>
          <li>
            <NavLink to={`${url}${search}`} exact className="tab-link">
              {DETAILS}
            </NavLink>
          </li>
          <li>
            <NavLink to={`${url}/logs${search}`} exact className="tab-link">
              {RUNS}
            </NavLink>
          </li>
          <li>
            <NavLink to={`${url}/contacts${search}`} exact className="tab-link">
              {CONTACTS}
            </NavLink>
          </li>
        </PageNav>
        <Switch>
          <Route exact path={path}>
            <IntegrationView />
          </Route>
          <Route path={`${path}/logs`}>
            <RunLogsView integration={integration} />
          </Route>
          <Route path={`${path}/contacts`}>
            <Wrapper>
              <ContactsView integration={integration} />
            </Wrapper>
          </Route>
        </Switch>
      </SingleIntegrationGrid>
    </IntegrationPageWrapper>
  );
};
export default IntegrationPage;

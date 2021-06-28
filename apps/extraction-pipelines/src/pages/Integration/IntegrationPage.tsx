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
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { useIntegrationById } from 'hooks/useIntegration';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useAppEnv } from 'hooks/useAppEnv';
import InteractiveCopyWithText from 'components/InteractiveCopyWithText';
import { IntegrationDetails } from 'components/integration/IntegrationDetails';
import { HEALTH_PATH, RouterParams } from 'routing/RoutingConfig';
import {
  EXT_PIPE_TAB_OVERVIEW,
  EXT_PIPE_TAB_RUN_HISTORY,
} from 'utils/constants';
import { IntegrationHealth } from 'components/integration/IntegrationHealth';
import { IntegrationHeading } from 'components/integration/IntegrationHeading';
import { LinkWrapper } from 'styles/StyledLinks';
import { RunFilterProvider } from 'hooks/runs/RunsFilterContext';
import { IntegrationBreadcrumbs } from 'components/navigation/breadcrumbs/IntegrationBreadcrumbs';
import { Span3 } from 'styles/grid/StyledGrid';

const PageNav = styled.ul`
  ${Span3};
  margin: 0;
  padding: 1rem 0 0.8rem 0;
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
  const { origin } = useAppEnv();
  const { id } = useParams<RouterParams>();
  const { setIntegration } = useSelectedIntegration();
  const { data: integration, isLoading } = useIntegrationById(parseInt(id, 10));
  useEffect(() => {
    if (integration) {
      setIntegration(integration);
    }
  }, [integration, setIntegration]);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <RunFilterProvider>
      <FullPageLayout
        pageHeadingText={integration?.name ?? ''}
        pageHeading={<IntegrationHeading />}
        headingSide={
          <LinkWrapper>
            <InteractiveCopyWithText
              id="copy-link-this-page"
              textToCopy={`${origin}${pathname}${search}`}
              copyType="pageLink"
            >
              <>Copy link to this page</>
            </InteractiveCopyWithText>
          </LinkWrapper>
        }
        breadcrumbs={<IntegrationBreadcrumbs integration={integration} />}
      >
        <PageNav>
          <li>
            <NavLink to={{ pathname: url, search }} exact className="tab-link">
              {EXT_PIPE_TAB_OVERVIEW}
            </NavLink>
          </li>
          <li>
            <NavLink
              to={{ pathname: `${url}/${HEALTH_PATH}`, search }}
              exact
              className="tab-link"
            >
              {EXT_PIPE_TAB_RUN_HISTORY}
            </NavLink>
          </li>
        </PageNav>
        <Switch>
          <Route exact path={path}>
            <IntegrationDetails />
          </Route>
          <Route path={`${path}/${HEALTH_PATH}`}>
            <IntegrationHealth integration={integration ?? null} />
          </Route>
        </Switch>
      </FullPageLayout>
    </RunFilterProvider>
  );
};
export default IntegrationPage;

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
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { LinkWrapper } from 'styles/StyledButton';
import { useIntegrationById } from 'hooks/useIntegration';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { INTEGRATIONS } from 'utils/baseURL';
import { useAppEnv } from 'hooks/useAppEnv';
import InteractiveCopyWithText from 'components/InteractiveCopyWithText';
import { IntegrationView } from 'components/integration/IntegrationView';
import { useDataSets } from 'hooks/useDataSets';
import { RouterParams } from 'routing/RoutingConfig';
import { RunLogsView } from 'components/integration/RunLogsView';
import { CONTACTS, DETAILS, INTEGRATION_OVERVIEW, RUNS } from 'utils/constants';
import { IntegrationHeading } from 'components/integration/IntegrationHeading';

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
  const { origin } = useAppEnv();
  const { id } = useParams<RouterParams>();
  const { setIntegration } = useSelectedIntegration();
  const { data: integration, isLoading } = useIntegrationById(parseInt(id, 10));
  const dataSetId: IdEither[] = integration?.dataSetId
    ? [{ id: parseInt(integration.dataSetId, 10) }]
    : [];
  const dataset = useDataSets(dataSetId);

  useEffect(() => {
    if (integration || dataset.data) {
      const res: Integration = {
        ...integration,
        ...(dataset.data && { dataSet: dataset.data[0] }),
      } as Integration;
      setIntegration(res);
    }
  }, [integration, dataset.data, setIntegration]);

  if (isLoading || dataset.isLoading) {
    return <Loader />;
  }
  return (
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
      link={{ path: `/${INTEGRATIONS}`, text: INTEGRATION_OVERVIEW }}
    >
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
          <RunLogsView integration={integration ?? null} />
        </Route>
      </Switch>
    </FullPageLayout>
  );
};
export default IntegrationPage;

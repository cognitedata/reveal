import React, { FunctionComponent, useEffect } from 'react';
import { useParams } from 'react-router';
import { Loader } from '@cognite/cogs.js';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { MainSidePanelGrid } from 'styles/grid/StyledGrid';
import { Integration } from 'model/Integration';
import { IdEither } from '@cognite/sdk';
import OverviewSidePanel from '../../components/tabs/OverviewSidePanel';
import { useIntegrationById } from '../../hooks/useIntegration';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';
import { StyledRouterLink } from '../../components/integrations/cols/Name';
import { INTEGRATIONS } from '../../utils/baseURL';
import { useAppEnv } from '../../hooks/useAppEnv';
import InteractiveCopyWithText from '../../components/InteractiveCopyWithText';
import { IntegrationView } from '../../components/integration/IntegrationView';
import { PageTitle } from '../../styles/StyledHeadings';
import { PageWrapper } from '../../styles/StyledPage';
import { useDataSets } from '../../hooks/useDataSets';
import { RouterParams } from '../../routing/RoutingConfig';

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
interface IntegrationPageProps {}

const IntegrationPage: FunctionComponent<IntegrationPageProps> = () => {
  const { pathname, search } = useLocation();
  const { cdfEnv, project, origin } = useAppEnv();
  const { id } = useParams<RouterParams>();
  const { integration, setIntegration } = useSelectedIntegration();
  const int = useIntegrationById(id);
  const dataSetId: IdEither[] = int.data?.dataSetId
    ? [{ id: parseInt(int.data.dataSetId, 10) }]
    : [];
  const dataset = useDataSets(dataSetId);
  useEffect(() => {
    if (int.data && dataset.data) {
      const res: Integration = { ...int.data, dataSet: dataset.data[0] };
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
      <MainSidePanelGrid>
        <IntegrationView />
        <OverviewSidePanel />
      </MainSidePanelGrid>
    </IntegrationPageWrapper>
  );
};
export default IntegrationPage;

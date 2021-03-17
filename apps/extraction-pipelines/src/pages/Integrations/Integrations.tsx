import React, { FunctionComponent, useEffect } from 'react';
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { LinkWrapper } from 'styles/StyledButton';
import { trackUsage } from 'utils/Metrics';
import { INTEGRATIONS } from 'utils/constants';
import { useIntegrations } from 'hooks/useIntegrations';
import {
  mapDataSetToIntegration,
  mapUniqueDataSetIds,
} from 'utils/dataSetUtils';
import { useDataSets } from 'hooks/useDataSets';
import NoIntegrations from 'components/error/NoIntegrations';
import { Loader } from '@cognite/cogs.js';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import IntegrationsTable from 'components/integrations/IntegrationsTable';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { useAppEnv } from 'hooks/useAppEnv';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/';

interface OwnProps {}

type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  const { project } = useAppEnv();
  useEffect(() => {
    trackUsage(INTEGRATIONS, { tenant: project });
  }, [project]);
  const {
    data,
    isLoading: isLoadingIntegrations,
    error: errorIntegrations,
    refetch,
  } = useIntegrations();
  const dataSetIds = mapUniqueDataSetIds(data);
  const { isLoading, data: dataSets } = useDataSets(dataSetIds);
  let tableData = data ?? [];
  if (data && data.length === 0) {
    return (
      <MainFullWidthGrid>
        <NoIntegrations />
      </MainFullWidthGrid>
    );
  }
  if (isLoading || isLoadingIntegrations) {
    return <Loader />;
  }
  const handleErrorDialogClick = async () => {
    await refetch();
  };

  if (errorIntegrations) {
    return (
      <MainFullWidthGrid>
        <ErrorFeedback
          btnText="Retry"
          onClick={handleErrorDialogClick}
          fallbackTitle="Could not get integrations"
          contentText="Please try again later."
          error={errorIntegrations}
        />
      </MainFullWidthGrid>
    );
  }

  if (dataSets) {
    tableData = mapDataSetToIntegration(data, dataSets);
  }
  return (
    <FullPageLayout
      pageHeadingText="Integrations"
      headingSide={
        <LinkWrapper>
          <ExtractorDownloadsLink
            linkText="Download Extractors"
            link={{ path: '/extractors' }}
          />
          <ExtractorDownloadsLink
            linkText="Learning and resources"
            link={{ url: LEARNING_AND_RESOURCES_URL }}
          />
        </LinkWrapper>
      }
    >
      <IntegrationsTable tableData={tableData} />
    </FullPageLayout>
  );
};
export default Integrations;

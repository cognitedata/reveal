import React, { FunctionComponent, useEffect } from 'react';
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { trackUsage } from 'utils/Metrics';
import {
  ERROR_NOT_GET_EXT_PIPE,
  EXTRACTION_PIPELINES,
  OVERVIEW,
} from 'utils/constants';
import { useIntegrations } from 'hooks/useIntegrations';
import NoIntegrations from 'components/error/NoIntegrations';
import { Loader } from '@cognite/cogs.js';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import IntegrationsTable from 'components/integrations/IntegrationsTable';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { useAppEnv } from 'hooks/useAppEnv';
import { Integration } from 'model/Integration';
import { LinkWrapper } from 'styles/StyledLinks';
import { ExtPipesBreadcrumbs } from 'components/navigation/breadcrumbs/ExtPipesBreadcrumbs';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/';

interface OwnProps {}

type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  const { project } = useAppEnv();
  useEffect(() => {
    trackUsage(OVERVIEW, { tenant: project });
  }, [project]);
  const {
    data,
    isLoading,
    error: errorIntegrations,
    refetch,
  } = useIntegrations();
  if (data && data.length === 0) {
    return (
      <MainFullWidthGrid>
        <NoIntegrations />
      </MainFullWidthGrid>
    );
  }
  if (isLoading) {
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
          fallbackTitle={ERROR_NOT_GET_EXT_PIPE}
          contentText="Please try again later."
          error={errorIntegrations}
        />
      </MainFullWidthGrid>
    );
  }

  return (
    <FullPageLayout
      pageHeadingText={EXTRACTION_PIPELINES}
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
      breadcrumbs={<ExtPipesBreadcrumbs />}
    >
      <IntegrationsTable tableData={data as Integration[]} />
    </FullPageLayout>
  );
};
export default Integrations;

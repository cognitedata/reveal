import { Button, Skeleton, Tooltip } from '@cognite/cogs.js';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useFetchCDFResource } from 'queries/useFetchCDFResource';
import { useFetchPowerOpsConfiguration } from 'queries/useFetchPowerOpsConfiguration';
import { generatePath } from 'react-router-dom';
import sidecar from 'utils/sidecar';

const { cdfApiBaseUrl } = sidecar;

interface CommonProps {
  type?: 'asset' | 'timeseries' | 'sequence' | 'event';
  endpoint?: 'assets' | 'timeseries' | 'sequences' | 'events';
}
interface CDFId extends CommonProps {
  cdfId: number;
  externalId?: undefined;
}
interface ExternalId extends CommonProps {
  cdfId?: undefined;
  externalId: string;
}

const Loading = (
  <Skeleton.Rectangle style={{ width: 28, height: 28, margin: 0 }} />
);

export const OpenInFusion = ({
  cdfId,
  externalId,
  type = 'event',
  endpoint = 'events',
}: CDFId | ExternalId) => {
  const { project } = useAuthenticatedAuthContext();
  const { data: configuration, status: configStatus } =
    useFetchPowerOpsConfiguration();
  const { data: resource, status: resourceStatus } = useFetchCDFResource(
    endpoint,
    externalId
  );

  if (configStatus === 'loading') return Loading;
  if (!cdfId && resourceStatus === 'loading') return Loading;
  if (configStatus === 'error' || resourceStatus === 'error')
    return <span>Error</span>;

  const link = () => {
    const finalId = () => {
      if (cdfId) return cdfId;
      if (resourceStatus === 'success') return resource.id;
      throw new Error('No resource to display');
    };
    const path = generatePath('/:project/explore/:type/:id', {
      project,
      type,
      id: finalId(),
    });
    const finalURL = new URL(
      `https://${configuration.organization_subdomain}.fusion.cognite.com${path}`
    );
    finalURL.searchParams.append('cluster', cdfApiBaseUrl);
    return finalURL.toString();
  };

  return (
    <Tooltip content="Open in CDF" placement="left">
      <Button
        size="small"
        icon="ExternalLink"
        aria-label="open-in-fusion"
        type="ghost"
        href={link()}
        target="_blank"
      />
    </Tooltip>
  );
};

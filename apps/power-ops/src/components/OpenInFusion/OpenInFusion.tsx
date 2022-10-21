import { Button, Tooltip } from '@cognite/cogs.js';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useFetchPowerOpsConfiguration } from 'queries/useFetchPowerOpsConfiguration';
import { useEffect, useState } from 'react';
import sidecar from 'utils/sidecar';

export const OpenInFusion = ({
  id,
  externalId,
  type = 'event',
  endPoint = 'events',
}: {
  id?: number;
  externalId?: string;
  type?: string;
  endPoint?: 'assets' | 'timeseries' | 'sequences' | 'events';
}) => {
  const { cdfApiBaseUrl } = sidecar;
  const { client } = useAuthenticatedAuthContext();

  const { data: configuration } = useFetchPowerOpsConfiguration();

  const [cdfId, setcdfId] = useState<number | undefined>(id);

  const fetchcdfId = async (externalId: string): Promise<void> => {
    if (!client) return;

    try {
      const [resource] = await client[endPoint].retrieve([{ externalId }]);
      setcdfId(resource.id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`No CDF Event found ${externalId}`);
    }
  };

  useEffect(() => {
    if (!id && externalId) fetchcdfId(externalId);
  }, [externalId]);

  return configuration?.organization_subdomain && client?.project && cdfId ? (
    <Tooltip content="Open in CDF" placement="left">
      <Button
        size="small"
        icon="ExternalLink"
        aria-label="open-in-fusion"
        type="ghost"
        href={`https://${configuration?.organization_subdomain}.fusion.cognite.com/${client?.project}/explore/${type}/${cdfId}?cluster=${cdfApiBaseUrl}`}
        target="_blank"
      />
    </Tooltip>
  ) : null;
};

import { Button, Tooltip } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { CogniteEvent } from '@cognite/sdk';
import { useFetchPowerOpsConfiguration } from 'queries/useFetchPowerOpsConfiguration';
import { useEffect, useState } from 'react';
import sidecar from 'utils/sidecar';

export const OpenInFusion = ({
  eventExternalId,
}: {
  eventExternalId: string;
}) => {
  const { cdfApiBaseUrl } = sidecar;
  const { client } = useAuthContext();

  const { data: configuration } = useFetchPowerOpsConfiguration();

  const [CDFEvent, setCDFEvent] = useState<CogniteEvent | undefined>();

  const fetchCDFEvent = async (externalId: string): Promise<void> => {
    if (!client) return;

    try {
      const [event] = await client.events.retrieve([{ externalId }]);
      setCDFEvent(event);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`No CDF Event found ${externalId}`);
    }
  };

  useEffect(() => {
    fetchCDFEvent(eventExternalId);
  }, [eventExternalId]);

  return configuration?.organization_subdomain &&
    client?.project &&
    CDFEvent?.id ? (
    <Tooltip content="Open in CDF" placement="left">
      <Button
        size="small"
        icon="ExternalLink"
        aria-label="open-in-fusion"
        type="ghost"
        href={`https://${configuration?.organization_subdomain}.fusion.cognite.com/${client?.project}/explore/event/${CDFEvent.id}?cluster=${cdfApiBaseUrl}`}
        target="_blank"
      />
    </Tooltip>
  ) : null;
};

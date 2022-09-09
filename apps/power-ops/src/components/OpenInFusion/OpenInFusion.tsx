import { Button, Tooltip } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState } from 'react';
import sidecar from 'utils/sidecar';

export const OpenInFusion = ({
  eventExternalId,
}: {
  eventExternalId: string;
}) => {
  const { client } = useAuthContext();

  const [fusionLink, setFusionLink] = useState<string>('');

  const createFusionLink = async () => {
    const subdomain = await client?.assets
      .retrieve([{ externalId: 'configurations' }])
      .then((response) => {
        return response[0].metadata?.organization_subdomain || '';
      });

    const eventId = await client?.events
      .retrieve([{ externalId: eventExternalId }])
      .then((response) => {
        return response[0].id || '';
      });

    setFusionLink(
      `https://${subdomain}.fusion.cognite.com/${client?.project}/explore/event/${eventId}?cluster=${sidecar.cdfApiBaseUrl}`
    );
  };

  useEffect(() => {
    createFusionLink();
  }, [eventExternalId]);

  return (
    <Tooltip content="Open in CDF" placement="left">
      <Button
        size="small"
        icon="ExternalLink"
        aria-label="open-in-fusion"
        type="ghost"
        href={fusionLink}
        target="_blank"
      />
    </Tooltip>
  );
};

import { Button, Tooltip } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import sidecar from 'utils/sidecar';

export const OpenInFusion = ({
  eventExternalId,
}: {
  eventExternalId: string;
}) => {
  const { client } = useAuthContext();

  const openInFusion = async () => {
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

    window.open(
      `https://${subdomain}.fusion.cognite.com/${client?.project}/explore/event/${eventId}?cluster=${sidecar.cdfApiBaseUrl}`
    );
  };

  return (
    <Tooltip content="Open in CDF" placement="left">
      <Button
        size="small"
        icon="ExternalLink"
        aria-label="open-in-fusion"
        type="ghost"
        onClick={() => openInFusion()}
      />
    </Tooltip>
  );
};

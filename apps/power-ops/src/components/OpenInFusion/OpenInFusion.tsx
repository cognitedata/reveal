import { Button, Tooltip } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { usePowerOpsConfiguration } from 'queries/usePowerOpsConfiguration';
import sidecar from 'utils/sidecar';

export const OpenInFusion = ({ eventId }: { eventId: string }) => {
  const { cdfApiBaseUrl } = sidecar;
  const { client } = useAuthContext();

  const { data: configuration } = usePowerOpsConfiguration(client);

  return (
    configuration?.organization_subdomain &&
    client?.project && (
      <Tooltip content="Open in CDF" placement="left">
        <Button
          size="small"
          icon="ExternalLink"
          aria-label="open-in-fusion"
          type="ghost"
          href={`https://${configuration?.organization_subdomain}.fusion.cognite.com/${client?.project}/explore/event/${eventId}?cluster=${cdfApiBaseUrl}`}
          target="_blank"
        />
      </Tooltip>
    )
  );
};

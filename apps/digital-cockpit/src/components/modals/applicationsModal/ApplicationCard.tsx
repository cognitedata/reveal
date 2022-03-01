import { AppDetailCard } from 'components/modals/elements';
import IconContainer from 'components/icons';
import { SpecialIconType } from 'components/icons/IconContainer';
import useCogniteApplications from 'hooks/useCogniteApplications';
import { useContext, useState } from 'react';
import { Button, Switch, Title, toast } from '@cognite/cogs.js';
import { useQuery } from 'react-query';
import { ApplicationItem } from 'store/config/types';
import {
  getGroupsState,
  isAdmin as isAdminSelector,
} from 'store/groups/selectors';
import { useAuthContext } from '@cognite/react-container';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { saveApplicationsList } from 'store/config/thunks';
import { ApiClientContext } from 'providers/ApiClientProvider';
import { useMetrics } from 'utils/metrics';

type ApplicationCardProps = {
  app: ApplicationItem;
};
const ApplicationCard = ({ app }: ApplicationCardProps) => {
  const metrics = useMetrics('SelectApplicationsModal');
  const apiClient = useContext(ApiClientContext);
  const { activeApplications } = useCogniteApplications();
  const { client } = useAuthContext();
  const dispatch = useDispatch<RootDispatcher>();

  const [isManuallyActive, setManuallyActive] = useState<boolean>(
    activeApplications.some((a) => a.key === app.key)
  );
  const { data: isInstalled, isLoading } = useQuery<boolean | undefined>(
    ['isInstalled', app.key],
    async () =>
      app.installedCheckFunc && client && app.installedCheckFunc(client),
    { enabled: !!app.installedCheckFunc }
  );

  const isAdmin = useSelector(isAdminSelector);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const canEdit = isAdmin && !groupsFilter?.length;

  const handleOnChange = () => {
    metrics.track('ManualInstall', { app: app.key, status: !isManuallyActive });
    if (isManuallyActive) {
      setManuallyActive(false);
      dispatch(
        saveApplicationsList(
          apiClient,
          activeApplications
            .filter((activeApp) => activeApp.key !== app.key)
            .map((x) => x.key)
        )
      );
    } else {
      setManuallyActive(false);
      dispatch(
        saveApplicationsList(apiClient, [
          ...activeApplications.map((app) => app.key),
          app.key,
        ])
      );
    }
  };

  const renderAction = () => {
    if (app.installable && isLoading) {
      return <Button loading />;
    }
    if (isInstalled) {
      return (
        <Button type="primary" disabled size="small">
          Installed
        </Button>
      );
    }

    if (app.installable) {
      return (
        <Button
          type="primary"
          onClick={() => {
            metrics.track('Installed', { app: app.key });
            if (app.installable) {
              app.installable();
            }
          }}
          size="small"
        >
          Install
        </Button>
      );
    }
    if (canEdit) {
      return (
        <Switch
          key={app.key}
          name={app.key}
          value={isManuallyActive}
          size="small"
          onChange={handleOnChange}
        />
      );
    }
    return (
      <Button
        type="primary"
        size="small"
        onClick={() => {
          metrics.track('DemoRequest', { app: app.key });
          toast.success(
            'Cognite has been notified of your request. We will be in touch!'
          );
        }}
      >
        Request a Demo
      </Button>
    );
  };

  return (
    <AppDetailCard key={app.key} isFeatured={!!app.featured}>
      {app.imageUrl && <img src={app.imageUrl} alt={app.title} />}
      <header>
        <IconContainer type={(app.iconKey as SpecialIconType) || 'Cognite'} />
        <Title level={5}>{app.title}</Title>
      </header>
      <p>{app.description}</p>
      <footer>
        {app.viewLink ? (
          <Button
            iconPlacement="right"
            icon="ExternalLink"
            size="small"
            onClick={() => {
              window.open(app.viewLink, '_blank');
            }}
          >
            View
          </Button>
        ) : (
          <div />
        )}

        {renderAction()}
      </footer>
    </AppDetailCard>
  );
};

export default ApplicationCard;

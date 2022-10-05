import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { projectsWithAppSwitcherEnabled } from 'config/features';
import { useProject } from 'hooks/config';
import { useNavigate } from 'hooks/navigation';
import { useComponentTranslations } from 'hooks/translations';
import AppBar from './AppBar';

const ConnectedAppBar = () => {
  const { data: user } = useUserInfo();
  const move = useNavigate();
  const project = useProject();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AppBar
      userName={user?.displayName ?? user?.email ?? 'Unknown'}
      onLogoutClick={handleLogout}
      onLogoClick={() => move('')}
      onProfileClick={() => move('/user')}
      translations={useComponentTranslations(AppBar)}
      hideAppSwitcher={!projectsWithAppSwitcherEnabled.includes(project)}
    />
  );
};

export default ConnectedAppBar;

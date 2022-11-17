import { getProject } from '@cognite/cdf-utilities';
import { useUserInfo } from 'hooks/useUserInfo';
import { projectsWithAppSwitcherEnabled } from 'config/features';
import { useNavigate } from 'react-router-dom';
import { useComponentTranslations } from 'hooks/translations';
import AppBar from './AppBar';

const ConnectedAppBar = () => {
  const { data: user } = useUserInfo();
  const move = useNavigate();
  const project = getProject();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };
  const handleLogoClick = () => {
    move('');
  };
  const handleProfileClick = () => {
    move('/user');
  };

  const translations = useComponentTranslations(AppBar);

  return (
    <AppBar
      userName={user?.displayName ?? user?.mail ?? 'Unknown'}
      onLogoutClick={handleLogout}
      onLogoClick={handleLogoClick}
      onProfileClick={handleProfileClick}
      translations={translations}
      hideAppSwitcher={!projectsWithAppSwitcherEnabled.includes(project)}
    />
  );
};

export default ConnectedAppBar;

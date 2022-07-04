import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useNavigate } from 'hooks/navigation';
import { useComponentTranslations } from 'hooks/translations';
import { useIntercom } from 'react-use-intercom';
import AppBar from '../../components/AppBar/AppBar';

const ConnectedAppBar = () => {
  const { data: user } = useUserInfo();
  const move = useNavigate();
  const { show: showIntercom } = useIntercom();

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AppBar
      userName={user?.displayName ?? user?.email ?? 'Unknown'}
      onLogoutClick={handleLogout}
      onLogoClick={() => move('')}
      onFeedbackClick={showIntercom}
      onProfileClick={() => move('/user')}
      translations={useComponentTranslations(AppBar)}
    />
  );
};

export default ConnectedAppBar;

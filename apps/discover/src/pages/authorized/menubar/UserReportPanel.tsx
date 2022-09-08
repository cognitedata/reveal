import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';

import { TopBar } from '@cognite/cogs.js';

import navigation from 'constants/navigation';

import { REPORT_PANEL, PATHNAMES } from './constants';

interface Props {
  activeTab: number;
  handleNavigation: (navigation: string, path: number) => void;
}

export const UserReportPanel = ({ activeTab, handleNavigation }: Props) => {
  const { data: roles } = useUserRoles();

  if (roles && !roles.isAdmin) {
    return (
      <TopBar.Navigation
        className="topbar-navigation-padding-fix"
        links={[
          {
            name: REPORT_PANEL,
            isActive: activeTab === PATHNAMES.REPORTS,
            onClick: () => {
              handleNavigation(navigation.REPORT_PANEL, PATHNAMES.REPORTS);
            },
          },
        ]}
      />
    );
  }

  return null;
};

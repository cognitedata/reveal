import SideMenu, {
  SideMenuItem,
} from '@transformations/components/side-menu/SideMenu';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';

export type TransformationSideMenuItem = 'home' | 'raw' | 'run-history';

const SIDE_MENU_ITEMS: SideMenuItem<TransformationSideMenuItem>[] = [
  { icon: 'ListSearch', key: 'raw', label: 'Browse data' },
  {
    icon: 'History',
    key: 'run-history',
    label: 'Run History',
  },
];

const TransformationDetailsSideMenu = (): JSX.Element => {
  const {
    isSidebarVisible,
    setIsSidebarVisible,
    activeSidePanelKey,
    setActiveSidePanelKey,
  } = useTransformationContext();

  const handleSelectedSideMenuItemChange = (
    item: SideMenuItem<TransformationSideMenuItem>
  ): void => {
    if (activeSidePanelKey === item.key) {
      setIsSidebarVisible((prevState) => !prevState);
      setActiveSidePanelKey(undefined);
    } else {
      setActiveSidePanelKey(item.key);
      setIsSidebarVisible(true);
    }
  };

  return (
    <SideMenu<TransformationSideMenuItem>
      isSidePanelVisible={isSidebarVisible}
      items={SIDE_MENU_ITEMS}
      onChange={handleSelectedSideMenuItemChange}
      selectedItemKey={activeSidePanelKey}
    />
  );
};

export default TransformationDetailsSideMenu;

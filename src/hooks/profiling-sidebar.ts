import { useContext, useEffect } from 'react';

import { RawExplorerContext } from 'contexts';
import { useActiveTable } from 'hooks/table-tabs';

export const useProfilingSidebar = () => {
  const {
    profilingSidebarOpenState,
    setProfilingSidebarOpenState,
    setSelectedColumnKey,
  } = useContext(RawExplorerContext);
  const [[activeTable] = []] = useActiveTable();

  const setIsProfilingSidebarOpen = (isOpen: boolean) => {
    if (!isOpen) setSelectedColumnKey(undefined);
    setProfilingSidebarOpenState(isOpen);
  };

  useEffect(() => {
    setIsProfilingSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTable]);

  return {
    isProfilingSidebarOpen: profilingSidebarOpenState,
    setIsProfilingSidebarOpen,
  };
};

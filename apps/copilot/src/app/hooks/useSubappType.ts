import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { CopilotSupportedFeatureType } from '@fusion/copilot-core';

import { getProject } from '@cognite/cdf-utilities';

export const useSubappType = () => {
  const location = useLocation();
  const project = getProject();
  const subApp: CopilotSupportedFeatureType | undefined = useMemo(() => {
    const pathName = location.pathname.substring(project.length + 1);
    // if (pathName.startsWith('/explore')) {
    //   return 'DataExploration';
    // }
    if (
      pathName.startsWith('/notebook/streamlit') &&
      // show only on the apps themselves, not the list page
      !pathName.endsWith('/notebook/streamlit')
    ) {
      return 'Streamlit';
    }
    // if (pathName === '') {
    //   return 'Homepage';
    // }
    return undefined;
  }, [location.pathname, project]);

  return subApp;
};

import { useEffect, useRef } from 'react';

import { useLocation } from '@fdx/shared/hooks/useLocation';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import {
  useSearchFilterParams,
  useSearchQueryParams,
  useSelectedInstanceParams,
} from '@fdx/shared/hooks/useParams';
import { useFDM } from '@fdx/shared/providers/FDMProvider';

import { ClickedNodeData } from '@cognite/reveal-react-components';

export function useNavigateOnClick(
  clickedNodeData: ClickedNodeData | undefined
): void {
  const { isSearchPage } = useLocation();

  const client = useFDM();
  const { toInstancePage, toSearchPage } = useNavigation();
  const [, setSelectedInstance] = useSelectedInstanceParams();
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();

  const lastClickedData = useRef<ClickedNodeData | undefined>(undefined);

  useEffect(() => {
    if (lastClickedData.current === clickedNodeData) {
      return;
    }

    lastClickedData.current = clickedNodeData;

    const fdmViews = clickedNodeData?.fdmResult?.views;
    const fdmNodes = clickedNodeData?.fdmResult?.fdmNodes;

    if (
      fdmViews === undefined ||
      fdmNodes === undefined ||
      fdmViews.length === 0 ||
      fdmNodes.length === 0
    ) {
      if (isSearchPage) {
        setSelectedInstance(undefined);
        return;
      }

      toSearchPage(query, filters);
      return;
    }

    const fdmNode = fdmNodes[0];
    const fdmView = fdmViews[0];

    if (isSearchPage) {
      setSelectedInstance({
        externalId: fdmNode.externalId,
        instanceSpace: fdmNode.space,
        dataType: fdmView.externalId,
      });

      return;
    }

    const dataModel = client.getDataModelByDataType(fdmView.externalId);

    setSelectedInstance(undefined);
    toInstancePage(
      fdmView.externalId,
      fdmNode.space,
      fdmNode.externalId,
      {
        dataModel: dataModel?.externalId,
        space: dataModel?.space,
        version: dataModel?.version,
      },
      { viewMode: '3d' }
    );
  }, [clickedNodeData]);
}

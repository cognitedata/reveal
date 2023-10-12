import { useEffect, useRef } from 'react';

import { ClickedNodeData } from '@cognite/reveal-react-components';

import {
  useSearchFilterParams,
  useSearchQueryParams,
  useSelectedInstanceParams,
} from '../../../../app/hooks/useParams';
import { useLocation } from '../../../hooks/useLocation';
import { useNavigation } from '../../../hooks/useNavigation';
import { useFDM } from '../../../providers/FDMProvider';

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

    if (
      clickedNodeData?.view === undefined ||
      clickedNodeData?.fdmNode === undefined
    ) {
      if (isSearchPage) {
        setSelectedInstance(undefined);
        return;
      }

      toSearchPage(query, filters);
      return;
    }

    if (isSearchPage) {
      setSelectedInstance({
        externalId: clickedNodeData.fdmNode.externalId,
        instanceSpace: clickedNodeData.fdmNode.space,
        dataType: clickedNodeData.view.externalId,
      });

      return;
    }

    const dataModel = client.getDataModelByDataType(
      clickedNodeData.view.externalId
    );

    setSelectedInstance(undefined);
    toInstancePage(
      clickedNodeData.view.externalId,
      clickedNodeData.fdmNode.space,
      clickedNodeData.fdmNode.externalId,
      {
        dataModel: dataModel?.externalId,
        space: dataModel?.space,
        version: dataModel?.version,
      },
      { viewMode: '3d' }
    );
  }, [clickedNodeData]);
}

import { useEffect, useRef } from 'react';

import { ClickedNodeData } from '@cognite/reveal-react-components';

import { useNavigation } from '../../../hooks/useNavigation';
import { useFDM } from '../../../providers/FDMProvider';

export function useNavigateOnClick(
  clickedNodeData: ClickedNodeData | undefined
): void {
  const { toInstancePage } = useNavigation();
  const fdmClient = useFDM();

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
      toInstancePage(undefined, undefined, undefined, undefined, {
        viewMode: '3d',
      });
    } else {
      const dataType = fdmClient.getDataModelByDataType(
        clickedNodeData.view.externalId
      )!;
      toInstancePage(
        dataType.externalId,
        clickedNodeData.fdmNode.space,
        clickedNodeData.fdmNode.externalId,
        {
          dataModel: dataType.externalId,
          space: dataType.space,
          version: dataType.version,
        },
        {
          viewMode: '3d',
        }
      );
    }
  }, [clickedNodeData]);
}

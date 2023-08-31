import { useEffect, useState } from 'react';

import { ClickedNodeData } from '@cognite/reveal-react-components';

export function useResetNodeDataOnNavigate(
  clickedNodeData: ClickedNodeData | undefined,
  externalId: string | undefined,
  space: string | undefined
): ClickedNodeData | undefined {
  const [lastClickedData, setLastClickedData] = useState<
    ClickedNodeData | undefined
  >(undefined);

  useEffect(() => {
    setLastClickedData(clickedNodeData);
  }, [clickedNodeData]);

  useEffect(() => {
    if (
      clickedNodeData?.fdmNode?.externalId === externalId &&
      clickedNodeData?.fdmNode?.space === space
    ) {
      return;
    }

    setLastClickedData(undefined);
  }, [externalId, space]);

  return lastClickedData;
}

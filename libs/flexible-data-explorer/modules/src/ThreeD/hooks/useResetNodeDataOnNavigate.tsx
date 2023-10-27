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
      clickedNodeData?.fdmResult?.fdmNodes[0]?.externalId === externalId &&
      clickedNodeData?.fdmResult?.fdmNodes[0]?.space === space
    ) {
      return;
    }

    setLastClickedData(undefined);
  }, [externalId, space]);

  return lastClickedData;
}

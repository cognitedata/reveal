/*!
 * Copyright 2023 Cognite AS
 */

import { PointerEventData } from '@cognite/reveal';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { FdmAssetMappingsConfig, NodeDataResult, useReveal } from '..';
import { queryMappedData } from '../components/Reveal3DResources/queryMappedData';
import { useFdmSdk, useSDK } from '../components/RevealContainer/SDKProvider';


type ClickedNodeProps = {
  children?: ReactNode;
  fdmConfig?: FdmAssetMappingsConfig;
};

const ClickedNodeContext = createContext<NodeDataResult | undefined | null>(undefined);

export const ClickedNode = ({ fdmConfig, children }: ClickedNodeProps) => {
  const viewer = useReveal();
  const sdk = useSDK();
  const fdmClient = useFdmSdk();

  const [clickedNode, setClickedNode] = useState<NodeDataResult | null>(null);

  useEffect(() => {

    const callback = async (pointerEvent: PointerEventData) => {
      const nodeData = await queryMappedData(viewer, sdk, fdmClient, pointerEvent, fdmConfig);
      setClickedNode(nodeData ?? null);
    };

    viewer.on('click', (event: PointerEventData) => void callback(event));
  }, [viewer]);


  return <ClickedNodeContext.Provider value={clickedNode}>
    {children}
  </ClickedNodeContext.Provider>
}

export const useClickedNode = (): NodeDataResult | null => {
  const nodeData = useContext(ClickedNodeContext);
  if (nodeData === undefined) {
    throw Error('useClickedNode must be used within a ClickedNode context');
  }
  return nodeData;
}

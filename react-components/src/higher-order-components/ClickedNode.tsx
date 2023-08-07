/*!
 * Copyright 2023 Cognite AS
 */

import { type PointerEventData } from '@cognite/reveal';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement
} from 'react';
import { type FdmAssetMappingsConfig, type NodeDataResult, useReveal } from '..';
import { queryMappedData } from '../components/Reveal3DResources/queryMappedData';
import { useFdmSdk, useSDK } from '../components/RevealContainer/SDKProvider';

type ClickedNodeProps = {
  children?: ReactNode;
  fdmConfig?: FdmAssetMappingsConfig;
};

const ClickedNodeContext = createContext<NodeDataResult | undefined | null>(undefined);

export const ClickedNode = ({ fdmConfig, children }: ClickedNodeProps): ReactElement => {
  const viewer = useReveal();
  const sdk = useSDK();
  const fdmClient = useFdmSdk();

  const [clickedNode, setClickedNode] = useState<NodeDataResult | null>(null);

  useEffect(() => {
    const callback = async (pointerEvent: PointerEventData): Promise<void> => {
      const nodeData = await queryMappedData(viewer, sdk, fdmClient, pointerEvent, fdmConfig);
      setClickedNode(nodeData ?? null);
    };

    viewer.on('click', (event: PointerEventData) => {
      void callback(event);
    });
  }, [viewer]);

  return <ClickedNodeContext.Provider value={clickedNode}>{children}</ClickedNodeContext.Provider>;
};

export const useClickedNode = (): NodeDataResult | null => {
  const nodeData = useContext(ClickedNodeContext);
  if (nodeData === undefined) {
    throw Error('useClickedNode must be used within a ClickedNode context');
  }
  return nodeData;
};

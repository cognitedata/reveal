/*!
 * Copyright 2023 Cognite AS
 */
import '@cognite/cogs.js/dist/cogs.css';

// Components
export { RevealContainer } from './components/RevealContainer/RevealContainer';
export { Reveal3DResources } from './components/Reveal3DResources/Reveal3DResources';
export { PointCloudContainer } from './components/PointCloudContainer/PointCloudContainer';
export { CadModelContainer } from './components/CadModelContainer/CadModelContainer';
export { Image360CollectionContainer } from './components/Image360CollectionContainer/Image360CollectionContainer';
export { Image360HistoricalDetails } from './components/Image360HistoricalDetails/Image360HistoricalDetails';
export { Image360Details } from './components/Image360Details/Image360Details';
export { ViewerAnchor } from './components/ViewerAnchor/ViewerAnchor';
export { RevealToolbar } from './components/RevealToolbar/RevealToolbar';
export { RevealKeepAlive } from './components/RevealKeepAlive/RevealKeepAlive';

// Hooks
export { useReveal } from './components/RevealContainer/RevealContext';
export { use3DModelName } from './hooks/use3DModelName';
export { useFdmAssetMappings } from './components/NodeCacheProvider/NodeCacheProvider';
export { useSceneDefaultCamera } from './hooks/useSceneDefaultCamera';
export {
  useClickedNodeData,
  type ClickedNodeData,
  type FdmNodeDataResult
} from './hooks/useClickedNode';
export { useCameraNavigation } from './hooks/useCameraNavigation';
export { use3dScenes } from './hooks/use3dScenes';
export { useMappedEdgesForRevisions } from './components/NodeCacheProvider/NodeCacheProvider';
export { useIsRevealInitialized } from './hooks/useIsRevealInitialized';
export { use3dNodeByExternalId } from './hooks/use3dNodeByExternalId';
export {
  useAllMappedEquipmentFDM,
  useSearchMappedEquipmentFDM,
  type SearchResultsWithView
} from './hooks/useSearchMappedEquipmentFDM';
export {
  useSearchMappedEquipmentAssetMappings,
  useAllMappedEquipmentAssetMappings,
  type ModelMappings,
  type ModelMappingsWithAssets
} from './hooks/useSearchMappedEquipmentAssetMappings';
export {
  useSearchAssetsMapped360Annotations,
  useAllAssetsMapped360Annotations
} from './hooks/useSearchAssetsMapped360Annotations';
export {
  useReveal360ImageAnnotationAssets,
  useSearchReveal360ImageAnnotationAssets
} from './hooks/useSearchReveal360ImageAnnotationAssets';
export {
  useAllAssetsMappedPointCloudAnnotations,
  useSearchAssetsMappedPointCloudAnnotations
} from './hooks/useSearchAssetsMappedPointCloudAnnotations';
export {
  usePointCloudAnnotationMappingsForModels,
  usePointCloudAnnotationAssetForAssetId
} from './components/NodeCacheProvider/PointCloudAnnotationCacheProvider';

// Higher order components
export { withSuppressRevealEvents } from './higher-order-components/withSuppressRevealEvents';
export {
  withCameraStateUrlParam,
  useGetCameraStateFromUrlParam
} from './higher-order-components/withCameraStateUrlParam';
// Types
export {
  type PointCloudModelStyling,
  type AnnotationIdStylingGroup
} from './components/PointCloudContainer/useApplyPointCloudStyling';
export { type AnnotationModelDataResult } from './hooks/useCalculatePointCloudModelsStyling';
export { type CogniteCadModelProps } from './components/CadModelContainer/CadModelContainer';
export {
  type CadModelStyling,
  type TreeIndexStylingGroup,
  type NodeStylingGroup
} from './components/CadModelContainer/useApplyCadModelStyling';
export {
  type Reveal3DResourcesProps,
  type FdmAssetStylingGroup,
  type DefaultResourceStyling
} from './components/Reveal3DResources/types';
export {
  SceneContainer,
  type SceneContainerProps
} from './components/SceneContainer/SceneContainer';
export type {
  AddImageCollection360Options,
  AddResourceOptions,
  AddReveal3DModelOptions
} from './components/Reveal3DResources/types';
export type { CameraNavigationActions } from './hooks/useCameraNavigation';
export type { Source, DmsUniqueIdentifier } from './utilities/FdmSDK';
export type { FdmInstanceWithView } from './utilities/types';
export type { QualitySettings } from './components/RevealToolbar/SettingsContainer/types';
export { WindowWidget } from './components/Widgets/WindowWidget';
export { use3dRelatedEdgeConnections } from './hooks/use3dRelatedEdgeConnections';
export { use3dRelatedDirectConnections } from './hooks/use3dRelatedDirectConnections';

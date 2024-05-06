/*!
 * Copyright 2023 Cognite AS
 */
import '@cognite/cogs.js/dist/cogs.css';

// Components
export { RevealCanvas } from './components/RevealCanvas/RevealCanvas';
export { RevealContext, type RevealContextProps } from './components/RevealContext/RevealContext';
export { RevealContainer } from './components/RevealContainer/RevealContainer';
export { Reveal3DResources } from './components/Reveal3DResources/Reveal3DResources';
export { Image360HistoricalDetails } from './components/Image360HistoricalDetails/Image360HistoricalDetails';
export { Image360Details } from './components/Image360Details/Image360Details';
export { ViewerAnchor } from './components/ViewerAnchor/ViewerAnchor';
export { RevealKeepAlive } from './components/RevealKeepAlive/RevealKeepAlive';
export {
  SceneContainer,
  type SceneContainerProps
} from './components/SceneContainer/SceneContainer';

export { RevealToolbar, type RevealToolbarProps } from './components/RevealToolbar/RevealToolbar';
export { RevealTopbar } from './components/RevealTopbar/RevealTopbar';
export { AxisGizmo, AxisGizmoOptions } from './components/AxisGizmo';
export { WindowWidget } from './components/Widgets/WindowWidget';

export { type Image360AnnotationAssetInfo } from './components/CacheProvider/types';

// Hooks
export { useReveal } from './components/RevealCanvas/ViewerContext';
export { useFdmAssetMappings } from './components/CacheProvider/NodeCacheProvider';
export { useSceneDefaultCamera } from './hooks/useSceneDefaultCamera';
export {
  useClickedNodeData,
  type ClickedNodeData,
  type FdmNodeDataResult
} from './hooks/useClickedNode';
export { useCameraNavigation } from './hooks/useCameraNavigation';
export { use3dModels } from './hooks/use3dModels';
export { useFdmMappedEdgesForRevisions } from './components/CacheProvider/NodeCacheProvider';
export { useIsRevealInitialized } from './hooks/useIsRevealInitialized';

export {
  usePointCloudAnnotationMappingsForModels,
  usePointCloudAnnotationMappingsForAssetIds
} from './components/CacheProvider/PointCloudAnnotationCacheProvider';
export { useImage360AnnotationMappingsForAssetIds } from './components/CacheProvider/Image360AnnotationCacheProvider';
export { useLoadedScene } from './components/SceneContainer/LoadedSceneContext';
export { useIsDraggingOnViewer } from './hooks/useIsDraggingOnViewer';

// Queries
export { use3DModelName } from './query/use3DModelName';
export { use3dScenes } from './query/use3dScenes';
export { use3dRelatedEdgeConnections } from './query/use3dRelatedEdgeConnections';
export { use3dRelatedDirectConnections } from './query/use3dRelatedDirectConnections';
export { use3dNodeByExternalId } from './query/use3dNodeByExternalId';
export {
  useAllMappedEquipmentFDM,
  useSearchMappedEquipmentFDM,
  type SearchResultsWithView
} from './query/useSearchMappedEquipmentFDM';
export {
  useSearchMappedEquipmentAssetMappings,
  useAllMappedEquipmentAssetMappings,
  type ModelMappings,
  type ModelMappingsWithAssets
} from './query/useSearchMappedEquipmentAssetMappings';
export {
  useSearchAssetsMapped360Annotations,
  useAllAssetsMapped360Annotations
} from './query/useSearchAssetsMapped360Annotations';
export {
  useAllAssetsMappedPointCloudAnnotations,
  useSearchAssetsMappedPointCloudAnnotations
} from './query/useSearchAssetsMappedPointCloudAnnotations';
export { useModelsForInstanceQuery } from './query/useModelsForInstanceQuery';

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
} from './components/Reveal3DResources/applyPointCloudStyling';
export { type CadModelStyling } from './components/Reveal3DResources/applyCadStyling';
export {
  type Reveal3DResourcesProps,
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type DefaultResourceStyling,
  type Image360AssetStylingGroup
} from './components/Reveal3DResources/types';
export type {
  AddImageCollection360Options,
  AddResourceOptions,
  AddReveal3DModelOptions
} from './components/Reveal3DResources/types';
export {
  type PointCloudAnnotationMappedAssetData,
  type Image360AnnotationMappedAssetData,
  type LayersUrlStateParam
} from './hooks/types';
export type { CameraNavigationActions } from './hooks/useCameraNavigation';
export type { Source, DmsUniqueIdentifier } from './utilities/FdmSDK';
export type { FdmInstanceWithView } from './utilities/types';
export type { QualitySettings } from './components/RevealToolbar/SettingsContainer/types';
export type { SceneIdentifiers } from './components/SceneContainer/sceneTypes';

// Rule Based Outputs
export { useFetchRuleInstances } from './components/RuleBasedOutputs/hooks/useFetchRuleInstances';
export { useCreateRuleInstance } from './components/RuleBasedOutputs/hooks/useCreateRuleInstance';
export { useEditRuleInstance } from './components/RuleBasedOutputs/hooks/useEditRuleInstance';
export { useDeleteRuleInstance } from './components/RuleBasedOutputs/hooks/useDeleteRuleInstance';
export { useSearchRuleInstance } from './components/RuleBasedOutputs/hooks/useSearchRuleInstance';
export type {
  RuleAndEnabled,
  TriggerType,
  RuleOutputSet,
  TimeseriesRuleTrigger,
  MetadataRuleTrigger,
  StringCondition,
  NumericCondition,
  StringExpression,
  NumericExpression,
  ExpressionOperator,
  Expression,
  ConcreteExpression,
  ColorRuleOutput,
  RuleWithOutputs,
  Rule,
  RuleOutput,
  ExpressionOperatorsTypes,
  StringConditionTypes,
  NumericConditionTypes,
  NumericWithinConditionType,
  NumericOutsideConditionType,
  CriteriaTypes
} from './components/RuleBasedOutputs/types';

// Functions
export { getRuleTriggerTypes } from './components/RuleBasedOutputs/utils';

export type { InstanceReference, AssetInstanceReference } from './utilities/types';

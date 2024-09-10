/*!
 * Copyright 2023 Cognite AS
 */
import '@cognite/cogs.js/dist/cogs.css';

// Components
export { RevealCanvas } from './components/RevealCanvas/RevealCanvas';
export { RevealContext, type RevealContextProps } from './components/RevealContext/RevealContext';
export { RevealContainer } from './components/RevealContainer/RevealContainer';
export { Reveal3DResources } from './components/Reveal3DResources/Reveal3DResources';
export { PointCloudContainer } from './components/PointCloudContainer/PointCloudContainer';
export { CadModelContainer } from './components/CadModelContainer/CadModelContainer';
export { Image360CollectionContainer } from './components/Image360CollectionContainer/Image360CollectionContainer';
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
export { useMappedEdgesForRevisions } from './components/CacheProvider/NodeCacheProvider';
export { useIsRevealInitialized } from './hooks/useIsRevealInitialized';

export {
  usePointCloudAnnotationMappingsForModels,
  usePointCloudAnnotationMappingsForAssetIds
} from './components/CacheProvider/PointCloudAnnotationCacheProvider';
export { useImage360AnnotationMappingsForAssetIds } from './components/CacheProvider/Image360AnnotationCacheProvider';
export { useLoadedScene } from './components/SceneContainer/LoadedSceneContext';
export { useIsDraggingOnViewer } from './hooks/useIsDraggingOnViewer';
export { useAssetMappedNodesForRevisions } from './components/CacheProvider/AssetMappingAndNode3DCacheProvider';

// Queries
export { use3DModelName } from './query/use3DModelName';
export { use3dScenes } from './hooks/scenes/use3dScenes';
export { use3dRelatedEdgeConnections } from './query/use3dRelatedEdgeConnections';
export { use3dRelatedDirectConnections } from './query/use3dRelatedDirectConnections';
export { use3dNodeByExternalId } from './query/use3dNodeByExternalId';
export {
  useAllMappedEquipmentFDM,
  useSearchMappedEquipmentFDM,
  type InstancesWithView
} from './query/useSearchMappedEquipmentFDM';
export {
  useSearchMappedEquipmentAssetMappings,
  useAllMappedEquipmentAssetMappings,
  useMappingsForAssetIds,
  type ModelMappings,
  type ModelMappingsWithAssets,
  type AssetPage,
  type ModelAssetPage
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
export { type CameraStateParameters } from './components/RevealCanvas/hooks/useCameraStateControl';
// Types
export {
  type PointCloudModelStyling,
  type AnnotationIdStylingGroup
} from './components/PointCloudContainer/useApplyPointCloudStyling';
export { type CogniteCadModelProps } from './components/CadModelContainer/CadModelContainer';
export {
  type CadModelStyling,
  type CadStylingGroup,
  type TreeIndexStylingGroup,
  type NodeStylingGroup
} from './components/CadModelContainer/types';
export {
  type Reveal3DResourcesProps,
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type DefaultResourceStyling,
  type Image360AssetStylingGroup,
  type CommonImage360Settings,
  type TaggedAddCadResourceOptions,
  type TaggedAddPointCloudResourceOptions,
  type TaggedAddResourceOptions,
  type TaggedAddImage360CollectionOptions,
  type AddImage360CollectionEventsOptions,
  type AddImage360CollectionDatamodelsOptions,
  type AddImage360CollectionOptions,
  type AddResourceOptions,
  type AddCadResourceOptions,
  type AddPointCloudResourceOptions,
  type CadModelOptions
} from './components/Reveal3DResources/types';
export {
  type PointCloudAnnotationMappedAssetData,
  type Image360AnnotationMappedAssetData,
  type LayersUrlStateParam,
  type DefaultLayersConfiguration,
  type ThreeDModelFdmMappings,
  type ModelWithRevision
} from './hooks/types';
export { type LayersButtonProps } from './components/RevealToolbar/LayersButton';
export type { CameraNavigationActions } from './hooks/useCameraNavigation';
export type { Source, DmsUniqueIdentifier } from './data-providers/FdmSDK';
export type { FdmInstanceWithView } from './data-providers/types';
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
  FdmRuleTrigger,
  FdmKeyRuleTriggerTyping,
  FdmRuleTriggerTyping,
  FdmInstanceNodeDataKey,
  StringCondition,
  NumericCondition,
  DatetimeCondition,
  BooleanCondition,
  StringExpression,
  NumericExpression,
  DatetimeExpression,
  BooleanExpression,
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
  NumericUniqueConditionTypes,
  NumericWithinConditionType,
  NumericOutsideConditionType,
  DatetimeConditionTypes,
  DatetimeUniqueConditionTypes,
  DatetimeBetweenConditionType,
  BooleanConditionTypes,
  CriteriaTypes,
  AllRuleBasedStylingGroups
} from './components/RuleBasedOutputs/types';

export { RuleBasedOutputsPanel } from './components/RuleBasedOutputs/RuleBasedOutputsPanel';

// Functions
export { getRuleTriggerTypes } from './components/RuleBasedOutputs/utils';

export type { InstanceReference, AssetInstanceReference } from './data-providers/types';

export { ActiveToolToolbar } from './components/Architecture/Toolbar';
export { DomainObjectPanel } from './components/Architecture/DomainObjectPanel';
export { RevealButtons } from './components/Architecture/RevealButtons';
export { useRenderTarget } from './components/RevealCanvas/ViewerContext';

/**
 * Export classes and types from architecture
 * Note: This is not stable code yet and is subject to change.
 * @beta
 */
export * as Architecture from './architecture/index';

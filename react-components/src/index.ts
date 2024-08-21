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
export { useRenderTarget } from './components/RevealCanvas/ViewerContext';
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
export { use3dScenes } from './query/use3dScenes';
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
export {
  withCameraStateUrlParam,
  useGetCameraStateFromUrlParam
} from './higher-order-components/withCameraStateUrlParam';
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
  type AddPointCloudResourceOptions
} from './components/Reveal3DResources/types';
export {
  type PointCloudAnnotationMappedAssetData,
  type Image360AnnotationMappedAssetData,
  type LayersUrlStateParam,
  type DefaultLayersConfiguration,
  type ThreeDModelFdmMappings
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

export { RuleBasedOutputsPanel } from './components/RuleBasedOutputs/RuleBasedOutputsPanel';

// Functions
export { getRuleTriggerTypes } from './components/RuleBasedOutputs/utils';

export type { InstanceReference, AssetInstanceReference } from './data-providers/types';

// ==================================================
// NEW ARCHITECTURE
// ==================================================

// New architecture: components
export { ActiveToolToolbar } from './components/Architecture/Toolbar';
export { DomainObjectPanel } from './components/Architecture/DomainObjectPanel';
export { RevealButtons } from './components/Architecture/RevealButtons';

// New architecture: commands
export { BaseCommand } from './architecture/base/commands/BaseCommand';
export type { CommandUpdateDelegate } from './architecture/base/commands/BaseCommand';
export { BaseFilterCommand } from './architecture/base/commands/BaseFilterCommand';
export { BaseOptionCommand } from './architecture/base/commands/BaseOptionCommand';
export { BaseSliderCommand } from './architecture/base/commands/BaseSliderCommand';
export { BaseTool } from './architecture/base/commands/BaseTool';
export { DomainObjectCommand } from './architecture/base/commands/DomainObjectCommand';
export { InstanceCommand } from './architecture/base/commands/InstanceCommand';
export { RenderTargetCommand } from './architecture/base/commands/RenderTargetCommand';
export { BaseEditTool } from './architecture/base/commands/BaseEditTool';
export { SettingsCommand } from './architecture/base/commands/SettingsCommand';
export { ShowAllDomainObjectsCommand } from './architecture/base/commands/ShowAllDomainObjectsCommand';
export { ShowDomainObjectsOnTopCommand } from './architecture/base/commands/ShowDomainObjectsOnTopCommand';

// New architecture: concreteCommands
export { CopyToClipboardCommand } from './architecture/base/concreteCommands/CopyToClipboardCommand';
export { DeleteDomainObjectCommand } from './architecture/base/concreteCommands/DeleteDomainObjectCommand';
export { FitViewCommand } from './architecture/base/concreteCommands/FitViewCommand';
export { KeyboardSpeedCommand } from './architecture/base/concreteCommands/KeyboardSpeedCommand';
export { NavigationTool } from './architecture/base/concreteCommands/NavigationTool';
export { PointCloudFilterCommand } from './architecture/base/concreteCommands/PointCloudFilterCommand';
export { SetPointColorTypeCommand } from './architecture/base/concreteCommands/SetPointColorTypeCommand';
export { SetPointShapeCommand } from './architecture/base/concreteCommands/SetPointShapeCommand';
export { SetPointSizeCommand } from './architecture/base/concreteCommands/SetPointSizeCommand';
export { SetQualityCommand } from './architecture/base/concreteCommands/SetQualityCommand';
export { ToggleMetricUnitsCommand } from './architecture/base/concreteCommands/ToggleMetricUnitsCommand';
export { UndoCommand } from './architecture/base/concreteCommands/UndoCommand';

// New architecture: domainObjects
export { DomainObject } from './architecture/base/domainObjects/DomainObject';
export { FolderDomainObject } from './architecture/base/domainObjects/FolderDomainObject';
export { RootDomainObject } from './architecture/base/domainObjects/RootDomainObject';
export { VisualDomainObject } from './architecture/base/domainObjects/VisualDomainObject';

export { BaseRevealConfig } from './architecture/base/renderTarget/BaseRevealConfig';
export { CommandsController } from './architecture/base/renderTarget/CommandsController';
export { DefaultRevealConfig } from './architecture/base/renderTarget/DefaultRevealConfig';
export { RevealRenderTarget } from './architecture/base/renderTarget/RevealRenderTarget';
export { UnitSystem } from './architecture/base/renderTarget/UnitSystem';

// New architecture: renderStyles
export { RenderStyle } from './architecture/base/renderStyles/RenderStyle';
export { CommonRenderStyle } from './architecture/base/renderStyles/CommonRenderStyle';

// New architecture: domainObjectsHelpers
export { BaseCreator } from './architecture/base/domainObjectsHelpers/BaseCreator';
export { BaseDragger } from './architecture/base/domainObjectsHelpers/BaseDragger';
export { Changes } from './architecture/base/domainObjectsHelpers/Changes';
export { CommandChanges } from './architecture/base/domainObjectsHelpers/CommandChanges';
export { ColorType } from './architecture/base/domainObjectsHelpers/ColorType';
export { DomainObjectChange } from './architecture/base/domainObjectsHelpers/DomainObjectChange';
export { FocusType } from './architecture/base/domainObjectsHelpers/FocusType';
export { PanelInfo } from './architecture/base/domainObjectsHelpers/PanelInfo';
export { PopupStyle } from './architecture/base/domainObjectsHelpers/PopupStyle';
export { Quantity } from './architecture/base/domainObjectsHelpers/Quantity';
export { Views } from './architecture/base/domainObjectsHelpers/Views';
export { VisibleState } from './architecture/base/domainObjectsHelpers/VisibleState';
export type { DomainObjectIntersection } from './architecture/base/domainObjectsHelpers/DomainObjectIntersection';
export { isDomainObjectIntersection } from './architecture/base/domainObjectsHelpers/DomainObjectIntersection';
export { isCustomObjectIntersection } from './architecture/base/domainObjectsHelpers/DomainObjectIntersection';

// New architecture: undo
export { DomainObjectTransaction } from './architecture/base/undo/DomainObjectTransaction';
export { Transaction } from './architecture/base/undo/Transaction';
export { UndoManager } from './architecture/base/undo/UndoManager';

// New architecture: utilities
export { ClosestGeometryFinder } from './architecture/base/utilities/geometry/ClosestGeometryFinder';
export { Index2 } from './architecture/base/utilities/geometry/Index2';
export { Range1 } from './architecture/base/utilities/geometry/Range1';
export { Range3 } from './architecture/base/utilities/geometry/Range3';
export { TrianglesBuffers } from './architecture/base/utilities/geometry/TrianglesBuffers';
export { getNextColor } from './architecture/base/utilities/colors/getNextColor';
export { getNextColorByIndex } from './architecture/base/utilities/colors/getNextColor';
export { getResizeCursor } from './architecture/base/utilities/geometry/getResizeCursor';
export type { TranslateDelegate } from './architecture/base/utilities/TranslateKey';
export type { TranslateKey } from './architecture/base/utilities/TranslateKey';

// New architecture: views
export { BaseView } from './architecture/base/views/BaseView';
export { GroupThreeView } from './architecture/base/views/GroupThreeView';
export { ThreeView } from './architecture/base/views/ThreeView';

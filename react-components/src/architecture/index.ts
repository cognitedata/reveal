import { installThreeViews } from './installThreeViews';
import { installToolbars } from './installToolbars';

// New architecture: commands
export type { CommandUpdateDelegate } from './base/commands/BaseCommand';
export { BaseCommand } from './base/commands/BaseCommand';
export { BaseFilterCommand } from './base/commands/BaseFilterCommand';
export { BaseFilterItemCommand } from './base/commands/BaseFilterCommand';
export { BaseOptionCommand } from './base/commands/BaseOptionCommand';
export { BaseSliderCommand } from './base/commands/BaseSliderCommand';
export { BaseTool } from './base/commands/BaseTool';
export { DomainObjectCommand } from './base/commands/DomainObjectCommand';
export { InstanceCommand } from './base/commands/InstanceCommand';
export { RenderTargetCommand } from './base/commands/RenderTargetCommand';
export { BaseEditTool } from './base/commands/BaseEditTool';
export { BaseSettingsCommand } from './base/commands/BaseSettingsCommand';
export { ShowAllDomainObjectsCommand } from './base/commands/ShowAllDomainObjectsCommand';
export { ShowDomainObjectsOnTopCommand } from './base/commands/ShowDomainObjectsOnTopCommand';

// New architecture: concreteCommands
export { CopyToClipboardCommand } from './base/concreteCommands/CopyToClipboardCommand';
export { DeleteDomainObjectCommand } from './base/concreteCommands/DeleteDomainObjectCommand';
export { FitViewCommand } from './base/concreteCommands/FitViewCommand';
export { KeyboardSpeedCommand } from './base/concreteCommands/KeyboardSpeedCommand';
export { NavigationTool } from './base/concreteCommands/NavigationTool';
export { PointCloudFilterCommand } from './base/concreteCommands/pointCloud/PointCloudFilterCommand';
export { SetPointColorTypeCommand } from './base/concreteCommands/pointCloud/SetPointColorTypeCommand';
export { SetPointShapeCommand } from './base/concreteCommands/pointCloud/SetPointShapeCommand';
export { SetPointSizeCommand } from './base/concreteCommands/pointCloud/SetPointSizeCommand';
export { SetQualityCommand } from './base/concreteCommands/SetQualityCommand';
export { SettingsCommand } from './base/concreteCommands/SettingsCommand';
export { ToggleMetricUnitsCommand } from './base/concreteCommands/ToggleMetricUnitsCommand';
export { UndoCommand } from './base/concreteCommands/UndoCommand';
export { BaseBannerCommand } from './base/commands/BaseBannerCommand';

// New architecture: domainObjects
export { DomainObject } from './base/domainObjects/DomainObject';
export { FolderDomainObject } from './base/domainObjects/FolderDomainObject';
export { RootDomainObject } from './base/domainObjects/RootDomainObject';
export { VisualDomainObject } from './base/domainObjects/VisualDomainObject';

export { BaseRevealConfig } from './base/renderTarget/BaseRevealConfig';
export { CommandsController } from './base/renderTarget/CommandsController';
export { type ContextMenuData } from './base/renderTarget/ContextMenuController';
export { DefaultRevealConfig } from './base/renderTarget/DefaultRevealConfig';
export { RevealRenderTarget } from './base/renderTarget/RevealRenderTarget';
export { UnitSystem } from './base/renderTarget/UnitSystem';

// New architecture: renderStyles
export { RenderStyle } from './base/renderStyles/RenderStyle';
export { CommonRenderStyle } from './base/renderStyles/CommonRenderStyle';

// New architecture: domainObjectsHelpers
export { BaseCreator } from './base/domainObjectsHelpers/BaseCreator';
export { BaseDragger } from './base/domainObjectsHelpers/BaseDragger';
export { Changes } from './base/domainObjectsHelpers/Changes';
export { CommandChanges } from './base/domainObjectsHelpers/CommandChanges';
export { DomainObjectChange } from './base/domainObjectsHelpers/DomainObjectChange';
export { ChangedDescription } from './base/domainObjectsHelpers/ChangedDescription';

export { ColorType } from './base/domainObjectsHelpers/ColorType';
export { FocusType } from './base/domainObjectsHelpers/FocusType';
export { PanelInfo } from './base/domainObjectsHelpers/PanelInfo';
export { PopupStyle } from './base/domainObjectsHelpers/PopupStyle';
export { Quantity } from './base/domainObjectsHelpers/Quantity';
export { Views } from './base/domainObjectsHelpers/Views';
export { VisibleState } from './base/domainObjectsHelpers/VisibleState';
export type { DomainObjectIntersection } from './base/domainObjectsHelpers/DomainObjectIntersection';
export { isDomainObjectIntersection } from './base/domainObjectsHelpers/DomainObjectIntersection';
export { isCustomObjectIntersection } from './base/domainObjectsHelpers/DomainObjectIntersection';

// New architecture: undo
export { DomainObjectTransaction } from './base/undo/DomainObjectTransaction';
export { Transaction } from './base/undo/Transaction';
export { UndoManager } from './base/undo/UndoManager';

// New architecture: utilities
export { Index2 } from './base/utilities/geometry/Index2';
export { Range1 } from './base/utilities/geometry/Range1';
export { Range3 } from './base/utilities/geometry/Range3';
export { TrianglesBuffers } from './base/utilities/geometry/TrianglesBuffers';
export { getNextColor } from './base/utilities/colors/getNextColor';
export { getNextColorByIndex } from './base/utilities/colors/getNextColor';
export { getResizeCursor } from './base/utilities/geometry/getResizeCursor';
export type { TranslateDelegate } from './base/utilities/TranslateInput';
export type { TranslationInput } from './base/utilities/TranslateInput';
export type { QualitySettings } from './base/utilities/quality/QualitySettings';

// New architecture: views
export { BaseView } from './base/views/BaseView';
export { GroupThreeView } from './base/views/GroupThreeView';
export { ThreeView } from './base/views/ThreeView';

// New architecture: 3D annotations
export { AnnotationsDomainObject } from './concrete/annotations/AnnotationsDomainObject';
export { AnnotationsRenderStyle } from './concrete/annotations/AnnotationsRenderStyle';
export { Annotation } from './concrete/annotations/helpers/Annotation';
export { Status } from './concrete/annotations/helpers/Status';
export { AnnotationUtils } from './concrete/annotations/helpers/AnnotationUtils';
export { AnnotationChangedDescription } from './concrete/annotations/helpers/AnnotationChangedDescription';
export { PrimitiveType } from './base/utilities/primitives/PrimitiveType';
export { AnnotationsSelectTool } from './concrete/annotations/commands/AnnotationsSelectTool';
export { AnnotationsCreateTool } from './concrete/annotations/commands/AnnotationsCreateTool';
export { getGlobalMatrix } from './concrete/annotations/helpers/getMatrixUtils';

// New architecture: 2D Annotations (Image360 Polygon)
export { Image360AnnotationDomainObject } from './concrete/annotation360/Image360AnnotationDomainObject';
export { Image360AnnotationFolder } from './concrete/annotation360/Image360AnnotationFolder';
export { Image360AnnotationSelectTool } from './concrete/annotation360/Image360AnnotationSelectTool';
export { Image360AnnotationCreateTool } from './concrete/annotation360/Image360AnnotationCreateTool';
export { DeleteSelectedImage360AnnotationCommand } from './concrete/annotation360/DeleteSelectedImage360AnnotationCommand';

// New architecture: points of interest
export * from './concrete/pointsOfInterest';

export type { LegacyIdentifier } from './concrete/annotation360/types';
export type { FdmIdentifier } from './concrete/annotation360/types';
export type { AnnotationIdentifier } from './concrete/annotation360/types';
export type { AssetIdentifier } from './concrete/annotation360/types';
export type { AnnotationStatus } from './concrete/annotation360/types';

installThreeViews();
installToolbars();

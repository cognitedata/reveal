/*!
 * Copyright 2024 Cognite AS
 */

import {
  AngleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Axis3DIcon,
  BorderHorizontalIcon,
  BorderVerticalIcon,
  BugIcon,
  CircleIcon,
  ClearAllIcon,
  CloseLargeIcon,
  CoordinatesIcon,
  CopyIcon,
  CropIcon,
  CubeFrontLeftIcon,
  CubeFrontRightIcon,
  CubeIcon,
  CubeTopIcon,
  CursorIcon,
  CylinderArbitraryIcon,
  CylinderHorizontalIcon,
  CylinderVerticalIcon,
  DeleteIcon,
  ExpandAlternativeIcon,
  EyeShowIcon,
  FilterIcon,
  FlagIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  FolderIcon,
  GrabIcon,
  type IconProps,
  InfoIcon,
  LeafIcon,
  LocationIcon,
  PerspectiveAltIcon,
  PerspectiveIcon,
  PlaneIcon,
  PlusIcon,
  PointCloudIcon,
  PolygonIcon,
  RefreshIcon,
  RestoreIcon,
  RulerAlternativeIcon,
  RulerIcon,
  SaveIcon,
  SettingsIcon,
  ShapesIcon,
  SnowIcon,
  SunIcon,
  SyncIcon,
  VectorLineIcon,
  VectorZigzagIcon,
  View360Icon,
  WaypointIcon
} from '@cognite/cogs.js';
import { type JSX, type FC } from 'react';
import { type IconName } from '../../architecture/base/utilities/IconName';

type IconType = FC<IconProps>;

const defaultMappings: Array<[IconName, IconType]> = [
  ['Angle', AngleIcon],
  ['ArrowLeft', ArrowLeftIcon],
  ['ArrowRight', ArrowRightIcon],
  ['Axis3D', Axis3DIcon],
  ['Bug', BugIcon],
  ['BorderHorizontal', BorderHorizontalIcon],
  ['BorderVertical', BorderVerticalIcon],
  ['Circle', CircleIcon],
  ['ClearAll', ClearAllIcon],
  ['CloseLarge', CloseLargeIcon],
  ['Coordinates', CoordinatesIcon],
  ['Copy', CopyIcon],
  ['Crop', CropIcon],
  ['Cube', CubeIcon],
  ['CubeFrontLeft', CubeFrontLeftIcon],
  ['CubeFrontRight', CubeFrontRightIcon],
  ['CubeTop', CubeTopIcon],
  ['Cursor', CursorIcon],
  ['CylinderHorizontal', CylinderHorizontalIcon],
  ['CylinderVertical', CylinderVerticalIcon],
  ['CylinderArbitrary', CylinderArbitraryIcon],
  ['Delete', DeleteIcon],
  ['ExpandAlternative', ExpandAlternativeIcon],
  ['EyeShow', EyeShowIcon],
  ['Filter', FilterIcon],
  ['Flag', FlagIcon],
  ['FlipHorizontal', FlipHorizontalIcon],
  ['FlipVertical', FlipVerticalIcon],
  ['Folder', FolderIcon],
  ['Grab', GrabIcon],
  ['Info', InfoIcon],
  ['Leaf', LeafIcon],
  ['Location', LocationIcon],
  ['Perspective', PerspectiveIcon],
  ['PerspectiveAlt', PerspectiveAltIcon],
  ['Plane', PlaneIcon],
  ['Plus', PlusIcon],
  ['PointCloud', PointCloudIcon],
  ['Polygon', PolygonIcon],
  ['Refresh', RefreshIcon],
  ['Restore', RestoreIcon],
  ['Ruler', RulerIcon],
  ['RulerAlternative', RulerAlternativeIcon],
  ['Save', SaveIcon],
  ['Shapes', ShapesIcon],
  ['Settings', SettingsIcon],
  ['Snow', SnowIcon],
  ['Sun', SunIcon],
  ['Sync', SyncIcon],
  ['VectorLine', VectorLineIcon],
  ['VectorZigzag', VectorZigzagIcon],
  ['View360', View360Icon],
  ['Waypoint', WaypointIcon]
];

const DefaultIcon = (_iconProps: IconProps): JSX.Element => <></>;

export class IconComponentMapper {
  private static readonly _iconMap = new Map<IconName, IconType>(defaultMappings);

  public static addIcon(name: IconName, icon: IconType): void {
    IconComponentMapper._iconMap.set(name, icon);
  }

  public static getIcon(name: IconName): IconType {
    if (name === undefined) {
      return DefaultIcon;
    }
    return IconComponentMapper._iconMap.get(name) ?? DefaultIcon;
  }
}

type IconComponentProps = IconProps & { iconName: IconName };

export const IconComponent = ({ iconName, ...rest }: IconComponentProps): JSX.Element => {
  const Icon = IconComponentMapper.getIcon(iconName);
  return <Icon {...rest} />;
};

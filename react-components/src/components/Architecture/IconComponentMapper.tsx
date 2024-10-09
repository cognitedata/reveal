/*!
 * Copyright 2024 Cognite AS
 */

import {
  AngleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Axis3DIcon,
  BugIcon,
  CircleIcon,
  ClearAllIcon,
  CoordinatesIcon,
  CopyIcon,
  CropIcon,
  CubeFrontLeftIcon,
  CubeFrontRightIcon,
  CubeIcon,
  CubeTopIcon,
  DeleteIcon,
  ExpandAlternativeIcon,
  EyeShowIcon,
  FilterIcon,
  FlagIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  FrameToolIcon,
  GrabIcon,
  type IconProps,
  LocationIcon,
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
  SnowIcon,
  SunIcon,
  VectorLineIcon,
  VectorZigzagIcon,
  View360Icon
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
  ['Circle', CircleIcon],
  ['ClearAll', ClearAllIcon],
  ['Coordinates', CoordinatesIcon],
  ['Copy', CopyIcon],
  ['Crop', CropIcon],
  ['Cube', CubeIcon],
  ['CubeFrontLeft', CubeFrontLeftIcon],
  ['CubeFrontRight', CubeFrontRightIcon],
  ['CubeTop', CubeTopIcon],
  ['Delete', DeleteIcon],
  ['ExpandAlternative', ExpandAlternativeIcon],
  ['EyeShow', EyeShowIcon],
  ['Filter', FilterIcon],
  ['Flag', FlagIcon],
  ['FlipHorizontal', FlipHorizontalIcon],
  ['FlipVertical', FlipVerticalIcon],
  ['FrameTool', FrameToolIcon],
  ['Grab', GrabIcon],
  ['Location', LocationIcon],
  ['Perspective', PerspectiveIcon],
  ['Plane', PlaneIcon],
  ['Plus', PlusIcon],
  ['PointCloud', PointCloudIcon],
  ['Polygon', PolygonIcon],
  ['Refresh', RefreshIcon],
  ['Restore', RestoreIcon],
  ['Ruler', RulerIcon],
  ['RulerAlternative', RulerAlternativeIcon],
  ['Save', SaveIcon],
  ['Settings', SettingsIcon],
  ['Snow', SnowIcon],
  ['Sun', SunIcon],
  ['VectorLine', VectorLineIcon],
  ['VectorZigzag', VectorZigzagIcon],
  ['View360', View360Icon]
];

const DefaultIcon = (_iconProps: IconProps): JSX.Element => <></>;

export class IconComponentMapper {
  private static readonly _iconMap = new Map<IconName, IconType>(defaultMappings);

  public static addIcon(name: IconName, icon: IconType): void {
    IconComponentMapper._iconMap.set(name, icon);
  }

  public static getIcon(name: IconName | undefined): IconType {
    if (name === undefined) {
      return DefaultIcon;
    }

    return IconComponentMapper._iconMap.get(name) ?? DefaultIcon;
  }
}

type IconComponentProps = IconProps & { iconName: IconName | undefined };

export const IconComponent = ({ iconName, ...rest }: IconComponentProps): JSX.Element => {
  const Icon = IconComponentMapper.getIcon(iconName);
  return <Icon {...rest} />;
};

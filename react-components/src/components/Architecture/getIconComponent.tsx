/*!
 * Copyright 2024 Cognite AS
 */
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Axis3DIcon,
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
  FlagIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  FrameToolIcon,
  GrabIcon,
  type IconProps,
  LocationIcon,
  PerspectiveIcon,
  PlaneIcon,
  PointCloudIcon,
  PolygonIcon,
  RefreshIcon,
  RulerAlternativeIcon,
  RulerIcon,
  VectorLineIcon,
  VectorZigzagIcon,
  View360Icon
} from '@cognite/cogs.js';
import { type JSX } from 'react';
import { assertNever } from '../../utilities/assertNever';

export type IconName =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Axis3D'
  | 'Circle'
  | 'ClearAll'
  | 'Coordinates'
  | 'Copy'
  | 'Crop'
  | 'Cube'
  | 'CubeFrontLeft'
  | 'CubeFrontRight'
  | 'CubeTop'
  | 'Delete'
  | 'ExpandAlternative'
  | 'EyeShow'
  | 'Flag'
  | 'FlipHorizontal'
  | 'FlipVertical'
  | 'FrameTool'
  | 'Grab'
  | 'Location'
  | 'Perspective'
  | 'Plane'
  | 'PointCloud'
  | 'Polygon'
  | 'Refresh'
  | 'Ruler'
  | 'RulerAlternative'
  | 'VectorLine'
  | 'VectorZigzag'
  | 'View360';

const DefaultIcon = (_iconProps: IconProps): JSX.Element => <></>;

export function getIconComponent(
  iconName: IconName | undefined
): (iconProps: IconProps) => JSX.Element {
  if (iconName === undefined) {
    return DefaultIcon;
  }

  switch (iconName) {
    case 'ArrowLeft':
      return ArrowLeftIcon;
    case 'ArrowRight':
      return ArrowRightIcon;
    case 'Axis3D':
      return Axis3DIcon;
    case 'Circle':
      return CircleIcon;
    case 'ClearAll':
      return ClearAllIcon;
    case 'Coordinates':
      return CoordinatesIcon;
    case 'Copy':
      return CopyIcon;
    case 'Crop':
      return CropIcon;
    case 'Cube':
      return CubeIcon;
    case 'CubeFrontLeft':
      return CubeFrontLeftIcon;
    case 'CubeFrontRight':
      return CubeFrontRightIcon;
    case 'CubeTop':
      return CubeTopIcon;
    case 'Delete':
      return DeleteIcon;
    case 'ExpandAlternative':
      return ExpandAlternativeIcon;
    case 'EyeShow':
      return EyeShowIcon;
    case 'Flag':
      return FlagIcon;
    case 'FlipHorizontal':
      return FlipHorizontalIcon;
    case 'FlipVertical':
      return FlipVerticalIcon;
    case 'FrameTool':
      return FrameToolIcon;
    case 'Grab':
      return GrabIcon;
    case 'Location':
      return LocationIcon;
    case 'Perspective':
      return PerspectiveIcon;
    case 'Plane':
      return PlaneIcon;
    case 'PointCloud':
      return PointCloudIcon;
    case 'Polygon':
      return PolygonIcon;
    case 'Refresh':
      return RefreshIcon;
    case 'Ruler':
      return RulerIcon;
    case 'RulerAlternative':
      return RulerAlternativeIcon;
    case 'VectorLine':
      return VectorLineIcon;
    case 'VectorZigzag':
      return VectorZigzagIcon;
    case 'View360':
      return View360Icon;
    default:
      assertNever(iconName);
  }
}

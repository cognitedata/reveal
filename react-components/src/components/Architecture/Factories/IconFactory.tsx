/*!
 * Copyright 2024 Cognite AS
 */

import { type JSX, type FC } from 'react';
import { type IconName } from '../../../architecture/base/utilities/IconName';
import { type IconProps } from '@cognite/cogs.js';
import { DefaultIcons } from './DefaultIcons';

export type IconType = FC<IconProps>;

const DefaultIcon = (_iconProps: IconProps): JSX.Element => <></>;

export class IconFactory {
  private static readonly _icons = new Map<IconName, IconType>(DefaultIcons);
  public static install(nameName: IconName, iconType: IconType): void {
    IconFactory._icons.set(nameName, iconType);
  }

  public static getIcon(nameName: IconName): IconType {
    if (nameName === undefined) {
      return DefaultIcon;
    }
    return IconFactory._icons.get(nameName) ?? DefaultIcon;
  }
}

type IconComponentProps = IconProps & { iconName: IconName };

export const IconComponent = ({ iconName, ...rest }: IconComponentProps): JSX.Element => {
  const Icon = IconFactory.getIcon(iconName);
  return <Icon {...rest} />;
};

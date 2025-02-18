/*!
 * Copyright 2024 Cognite AS
 */

import { type JSX } from 'react';
import { type IconName } from '../../../architecture/base/utilities/IconName';
import { type IconProps } from '@cognite/cogs.js';
import { DefaultIcons } from './DefaultIcons';
import { type IconType } from './IconType';

const DefaultIcon = (_iconProps: IconProps): JSX.Element => <></>;

export class IconFactory {
  private static readonly _icons = new Map<IconName, IconType>(DefaultIcons);
  public static install(iconName: IconName, iconType: IconType): void {
    IconFactory._icons.set(iconName, iconType);
  }

  public static getIcon(iconName: IconName): IconType {
    if (iconName === undefined) {
      return DefaultIcon;
    }
    return IconFactory._icons.get(iconName) ?? DefaultIcon;
  }
}

type IconComponentProps = IconProps & { iconName: IconName };

export const IconComponent = ({ iconName, ...rest }: IconComponentProps): JSX.Element => {
  const Icon = IconFactory.getIcon(iconName);
  return <Icon {...rest} />;
};

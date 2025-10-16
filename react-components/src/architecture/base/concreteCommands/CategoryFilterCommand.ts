/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslationKey, type TranslationInput } from '../utilities/TranslateInput';
import { BaseOptionCommand, OptionType } from '../commands/BaseOptionCommand';
import { BaseCommand } from '../commands/BaseCommand';
import { type IconName } from '../utilities/IconName';
import { effect, type Signal, signal } from '@cognite/signals';

export enum CategoryType {
  All = 'all',
  Scenes = 'scene',
  Cad = 'cad',
  Image360 = 'image360',
  PointCloud = 'pointClouds'
}

export class CategoryFilterCommand extends BaseOptionCommand {
  private readonly _category = signal(CategoryType.All);

  public get category(): Signal<CategoryType> {
    return this._category;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(OptionType.Segmented);
    this.add(new CategoryCommand(this, CategoryType.All, undefined, 'ALL'));
    this.add(new CategoryCommand(this, CategoryType.Scenes, 'Cubes', 'SCENE'));
    this.add(new CategoryCommand(this, CategoryType.Cad, 'Cube', 'CAD_MODELS'));
    this.add(new CategoryCommand(this, CategoryType.Image360, 'View360', 'IMAGES_360'));
    this.add(new CategoryCommand(this, CategoryType.PointCloud, 'PointCloud', 'POINT_CLOUDS'));

    effect(() => {
      this.category();
      this.update();
    });
  }

  public override get hasData(): boolean {
    return false; // Should not be reused
  }
}

class CategoryCommand extends BaseCommand {
  private readonly _icon: IconName;
  private readonly _category: CategoryType;
  private readonly _tooltip: TranslationInput;
  private readonly _parent: CategoryFilterCommand;

  constructor(
    parent: CategoryFilterCommand,
    category: CategoryType,
    icon: IconName,
    key: TranslationKey
  ) {
    super();
    this._parent = parent;
    this._category = category;
    this._icon = icon;
    this._tooltip = { key };
  }

  public override get icon(): IconName {
    return this._icon;
  }

  public override get tooltip(): TranslationInput | undefined {
    return this._tooltip;
  }

  public override get isChecked(): boolean {
    return this._parent.category() === this._category;
  }

  public override invokeCore(): boolean {
    this._parent.category(this._category);
    return true;
  }
}

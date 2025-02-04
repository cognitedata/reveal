/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../utilities/IconName';
import { type TranslateDelegate, type TranslationInput } from '../utilities/TranslateInput';
import { Quantity } from './Quantity';

type PanelItemProps = {
  translationInput: TranslationInput;
  icon?: IconName;
  value?: number;
  quantity?: Quantity;
};

export class PanelInfo {
  public readonly items: NumberPanelItem[] = [];
  public add(props: PanelItemProps): void {
    const item = new NumberPanelItem(props);
    this.items.push(item);
  }
}

export class PanelItem {
  translationInput: TranslationInput;

  constructor(props: TranslationInput) {
    this.translationInput = props;
  }

  public getText(translate: TranslateDelegate): string | undefined {
    return translate(this.translationInput);
  }
}

export class NumberPanelItem extends PanelItem {
  public icon: string | undefined = undefined;
  public value: number;
  public quantity: Quantity;

  constructor(props: PanelItemProps) {
    super(props.translationInput);
    this.icon = props.icon;
    this.value = props.value ?? 0;
    this.quantity = props.quantity ?? Quantity.Unitless;
  }
}

/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateDelegate, type TranslateKey } from '../utilities/TranslateKey';
import { Quantity } from './Quantity';

type PanelItemProps = {
  key?: string;
  fallback: string;
  icon?: string;
  value?: number;
  quantity?: Quantity;
};

export class PanelInfo {
  public header?: PanelItem;
  public readonly items: NumberPanelItem[] = [];

  public setHeader(translateKey: TranslateKey): void {
    const { key, fallback } = translateKey;
    this.header = new PanelItem({ key, fallback });
  }

  public add(props: PanelItemProps): void {
    const item = new NumberPanelItem(props);
    this.items.push(item);
  }
}

export class PanelItem {
  public key?: string;
  public fallback: string;

  constructor(props: TranslateKey) {
    this.key = props.key;
    this.fallback = props.fallback;
  }

  public getText(translate: TranslateDelegate): string | undefined {
    const { key, fallback } = this;
    if (key !== undefined) {
      return translate(key, fallback);
    }
    if (fallback.length === 0) {
      return undefined;
    }
    return fallback;
  }
}

export class NumberPanelItem extends PanelItem {
  public icon: string | undefined = undefined;
  public value: number;
  public quantity: Quantity;

  constructor(props: PanelItemProps) {
    super(props);
    this.icon = props.icon;
    this.value = props.value ?? 0;
    this.quantity = props.quantity ?? Quantity.Unitless;
  }
}

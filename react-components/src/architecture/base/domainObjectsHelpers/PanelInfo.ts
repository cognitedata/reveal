/*!
 * Copyright 2024 Cognite AS
 */

export enum NumberType {
  Unitless,
  Length,
  Area,
  Volume
}

export class PanelInfo {
  public header?: PanelItem;
  public readonly items: NumberPanelItem[] = [];

  public setHeader(key: string, fallback: string): void {
    this.header = new PanelItem(key, fallback);
  }

  public add(
    key: string,
    fallback: string,
    value: number,
    numberType: NumberType = NumberType.Unitless,
    decimals: number = 2
  ): void {
    const item = new NumberPanelItem(key, fallback, value, numberType, decimals);
    this.items.push(item);
  }
}

export class PanelItem {
  public key: string;
  public fallback: string;

  constructor(key: string, fallback: string) {
    this.key = key;
    this.fallback = fallback;
  }
}

export class NumberPanelItem extends PanelItem {
  public value: number;
  public numberType: NumberType;
  public decimals: number;

  constructor(
    key: string,
    fallback: string,
    value: number,
    numberType: NumberType,
    decimals: number
  ) {
    super(key, fallback);
    this.value = value;
    this.numberType = numberType;
    this.decimals = decimals;
  }

  public valueToString(): string {
    return this.value.toFixed(this.decimals);
  }

  public getUnit(): string {
    switch (this.numberType) {
      case NumberType.Unitless:
        return '';
      case NumberType.Length:
        return 'm';
      case NumberType.Area:
        return 'm²';
      case NumberType.Volume:
        return 'm³';
    }
  }
}

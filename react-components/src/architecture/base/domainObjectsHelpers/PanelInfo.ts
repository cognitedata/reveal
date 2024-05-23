/*!
 * Copyright 2024 Cognite AS
 */

export class PanelInfo {
  public header?: PanelItem;
  public readonly items: NumberPanelItem[] = [];
  public setHeader(key: string, fallback: string): void {
    this.header = new PanelItem(key, fallback);
  }

  public add(key: string, fallback: string, value: number, decimals: number = 2): void {
    const item = new NumberPanelItem(key, fallback, value, decimals);
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
  public decimals: number;

  constructor(key: string, fallback: string, value: number, decimals: number) {
    super(key, fallback);
    this.value = value;
    this.decimals = decimals;
  }

  public valueToString(): string {
    return this.value.toFixed(this.decimals) + ' m';
  }
}

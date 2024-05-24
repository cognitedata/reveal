/*!
 * Copyright 2024 Cognite AS
 */

export enum NumberType {
  Unitless,
  Length,
  Area,
  Volume,
  Degrees
}

type PanelItemProps = {
  key?: string;
  fallback?: string;
  icon?: string;
  value?: number;
  numberType?: NumberType;
  decimals?: number;
};

export class PanelInfo {
  public header?: PanelItem;
  public readonly items: NumberPanelItem[] = [];

  public setHeader(key: string, fallback: string): void {
    this.header = new PanelItem({ key, fallback });
  }

  public add(props: PanelItemProps): void {
    const item = new NumberPanelItem(props);
    this.items.push(item);
  }
}

export class PanelItem {
  public key?: string;
  public fallback?: string;

  constructor(props: PanelItemProps) {
    this.key = props.key;
    this.fallback = props.fallback;
  }
}

export class NumberPanelItem extends PanelItem {
  public icon: string | undefined = undefined;
  public value: number;
  public numberType: NumberType;
  public decimals: number;

  constructor(props: PanelItemProps) {
    super(props);
    this.value = props.value ?? 0;
    this.numberType = props.numberType ?? NumberType.Unitless;
    this.decimals = props.decimals ?? 2;
  }

  public get valueAsString(): string {
    return this.value.toFixed(this.decimals);
  }

  public get unit(): string {
    return getUnit(this.numberType);
  }
}

function getUnit(numberType: NumberType): string {
  switch (numberType) {
    case NumberType.Unitless:
      return '';
    case NumberType.Length:
      return 'm';
    case NumberType.Area:
      return 'm²';
    case NumberType.Volume:
      return 'm³';
    case NumberType.Degrees:
      return '°';
  }
}

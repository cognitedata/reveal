type PopupProps = {
  horizontal?: boolean;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  margin?: number;
  padding?: number;
};

export class PopupStyle {
  public readonly left?: number = undefined;
  public readonly right?: number = undefined;
  public readonly top?: number = undefined;
  public readonly bottom?: number = undefined;
  private readonly _margin: number = 8; // margin outside the popup
  private readonly _padding: number = 6; // margin inside the popup
  private readonly _horizontal: boolean = true; // Used for toolbars only

  public constructor(props: PopupProps) {
    this.left = props.left;
    this.right = props.right;
    this.top = props.top;
    this.bottom = props.bottom;
    if (props.margin !== undefined) {
      this._margin = props.margin;
    }
    if (props.padding !== undefined) {
      this._padding = props.padding;
    }
    if (props.horizontal !== undefined) {
      this._horizontal = props.horizontal;
    }
  }

  public get leftPx(): string {
    return PopupStyle.getStringWithPx(this.left);
  }

  public get rightPx(): string {
    return PopupStyle.getStringWithPx(this.right);
  }

  public get topPx(): string {
    return PopupStyle.getStringWithPx(this.top);
  }

  public get bottomPx(): string {
    return PopupStyle.getStringWithPx(this.bottom);
  }

  public get marginPx(): string {
    return PopupStyle.getStringWithPx(this._margin);
  }

  public get paddingPx(): string {
    return PopupStyle.getStringWithPx(this._padding);
  }

  public static getStringWithPx(value?: number): string {
    return value === undefined ? 'undefined' : value.toString() + 'px';
  }

  public get flexFlow(): string {
    return this._horizontal ? 'row' : 'column';
  }

  public get isHorizontal(): boolean {
    return this._horizontal;
  }

  public get isHorizontalDivider(): boolean {
    return !this._horizontal;
  }
}

/*!
 * Copyright 2024 Cognite AS
 * BaseTool: Base class for the tool are used to interact with the render target.
 */

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
  private readonly _horizontal: boolean = true;
  private readonly _left?: number = undefined;
  private readonly _right?: number = undefined;
  private readonly _top?: number = undefined;
  private readonly _bottom?: number = undefined;
  private readonly _margin: number = 16; // margin ouside the popup
  private readonly _padding: number = 8; // margin inside the popup

  public constructor(props: PopupProps) {
    if (props.horizontal !== undefined) {
      this._horizontal = props.horizontal;
    }
    this._left = props.left;
    this._right = props.right;
    this._top = props.top;
    this._bottom = props.bottom;
    if (props.margin !== undefined) {
      this._margin = props.margin;
    }
    if (props.padding !== undefined) {
      this._padding = props.padding;
    }
  }

  public get flexFlow(): string {
    return this._horizontal ? 'row' : 'column';
  }

  public get isHorizontalDivider(): boolean {
    return !this._horizontal;
  }

  public get leftPx(): string {
    return PopupStyle.getStringWithPx(this._left);
  }

  public get rightPx(): string {
    return PopupStyle.getStringWithPx(this._right);
  }

  public get topPx(): string {
    return PopupStyle.getStringWithPx(this._top);
  }

  public get bottomPx(): string {
    return PopupStyle.getStringWithPx(this._bottom);
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
}

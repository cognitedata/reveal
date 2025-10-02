import { type TranslationInput } from '../utilities/translation/TranslateInput';
import { translate } from '../utilities/translation/translateUtils';
import { Quantity } from './Quantity';

export type SetValue = (value: number) => void;
export type VerifyValue = (value: number) => boolean;

type PanelItemProps = {
  translationInput: TranslationInput;
  value?: number;
  quantity?: Quantity;
  setValue?: SetValue;
  verifyValue?: VerifyValue;
};

export class PanelInfo {
  public readonly items: NumberPanelItem[] = [];
  public add(props: PanelItemProps): void {
    const item = new NumberPanelItem(props);
    this.items.push(item);
  }

  public getItemsByQuantity(quantity: Quantity): NumberPanelItem[] {
    return this.items.filter((a) => a.quantity === quantity);
  }
}

export class PanelItem {
  translationInput: TranslationInput;

  constructor(props: TranslationInput) {
    this.translationInput = props;
  }

  public getText(): string | undefined {
    return translate(this.translationInput);
  }
}

export class NumberPanelItem extends PanelItem {
  public value: number;
  public quantity: Quantity;
  setValue?: SetValue;
  verifyValue?: VerifyValue;

  constructor(props: PanelItemProps) {
    super(props.translationInput);
    this.value = props.value ?? 0;
    this.quantity = props.quantity ?? Quantity.Unitless;
    this.setValue = props.setValue;
    this.verifyValue = props.verifyValue;

    // Set default verify function if setValue is defined and verifyValue is undefined
    if (this.setValue !== undefined && this.verifyValue === undefined) {
      this.verifyValue = (value: number) => !Number.isNaN(value);
    }
  }
}

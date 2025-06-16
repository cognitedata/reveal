import { type IconName } from '../utilities/IconName';
import { type TranslationInput } from '../utilities/TranslateInput';
import { translate } from '../utilities/translateUtils';
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

import { type UnitSystem } from '../renderTarget/UnitSystem';
import {
  isTranslatedString,
  type TranslationKey,
  type TranslationInput
} from '../utilities/translation/TranslateInput';
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

  public getItemTranslationKey(key: TranslationKey): NumberPanelItem | undefined {
    return this.items.find(
      (item) => isTranslatedString(item.translationInput) && item.translationInput.key === key
    );
  }
}

export class PanelItem {
  public readonly translationInput: TranslationInput;

  constructor(props: TranslationInput) {
    this.translationInput = props;
  }

  public get label(): string | undefined {
    return translate(this.translationInput);
  }
}

export class NumberPanelItem extends PanelItem {
  public readonly value: number;
  public readonly quantity: Quantity;
  public readonly setValue?: SetValue;
  public readonly verifyValue?: VerifyValue;

  constructor(props: PanelItemProps) {
    super(props.translationInput);
    this.value = props.value ?? 0;
    this.quantity = props.quantity ?? Quantity.Unitless;
    this.setValue = props.setValue;
    this.verifyValue = props.verifyValue;
  }

  public trySetValue(valueInCurrentUnit: number, unitSystem: UnitSystem): boolean {
    if (this.setValue === undefined) {
      return false;
    }
    if (Number.isNaN(valueInCurrentUnit)) {
      return false;
    }
    const valueInMetricUnit = unitSystem.convertFromUnit(valueInCurrentUnit, this.quantity);
    if (this.verifyValue !== undefined && !this.verifyValue(valueInMetricUnit)) {
      return false;
    }
    this.setValue(valueInMetricUnit);
    return true;
  }
}

import { Util } from '../../../Core/Primitives/Util';

type ClosestOption = {
  value: string;
  label: string;
} | null;
export class NumericUtils {
  public static findClosestOption(
    optionValues?: { value: string; label: string }[],
    val?: string
  ): ClosestOption {
    let closestOption: ClosestOption = null;
    if (optionValues && val) {
      const sanitizedValue = Util.getNumber(val);
      closestOption = optionValues?.reduce((prev, curr) =>
        Math.abs(Util.getNumber(curr.value) - sanitizedValue) <
        Math.abs(Util.getNumber(prev.value) - sanitizedValue)
          ? curr
          : prev
      );
    }
    return closestOption;
  }

  public static findIndexOfValueInOptions(
    optionValues?: { value: string; label: string }[],
    val?: string
  ): number {
    let optionIndex = 0;
    if (optionValues && val) {
      let closestValue: ClosestOption | string | undefined;
      if (Util.isNumber(val))
        closestValue = NumericUtils.findClosestOption(optionValues, val)?.value;
      else closestValue = val;
      if (closestValue)
        optionIndex = optionValues.findIndex(
          (optionValue) => optionValue.value === closestValue
        );
    }
    return optionIndex;
  }
}

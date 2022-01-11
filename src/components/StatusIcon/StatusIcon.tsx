/**
 * Status Icons
 */

import { CalculationStatusStatusEnum } from '@cognite/calculation-backend';
import { AllIconTypes, Icon } from '@cognite/cogs.js';

export type StatusIconProps = {
  status: CalculationStatusStatusEnum;
};

export const StatusIcon = ({ status }: StatusIconProps) => {
  switch (status) {
    case CalculationStatusStatusEnum.Pending:
    case CalculationStatusStatusEnum.Running:
      return <Icon type="Loading" />;
    case CalculationStatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case CalculationStatusStatusEnum.Cancelled:
      return <Icon type="WarningStroke" />;
    case CalculationStatusStatusEnum.Unknown:
      return <Icon type="Help" />;
    case CalculationStatusStatusEnum.Failed:
    case CalculationStatusStatusEnum.Error:
      return <Icon type="ErrorStroked" title="Failed" />;
    default:
      return null;
  }
};

export function getIconTypeFromStatus(
  status: CalculationStatusStatusEnum
): AllIconTypes {
  switch (status) {
    case CalculationStatusStatusEnum.Pending:
    case CalculationStatusStatusEnum.Running:
      return 'Loading';
    case CalculationStatusStatusEnum.Success:
      return 'Checkmark';
    case CalculationStatusStatusEnum.Cancelled:
      return 'WarningStroke';
    case CalculationStatusStatusEnum.Unknown:
      return 'Help';
    case CalculationStatusStatusEnum.Failed:
    case CalculationStatusStatusEnum.Error:
      return 'ErrorStroked';
    default:
      return 'Cognite';
  }
}

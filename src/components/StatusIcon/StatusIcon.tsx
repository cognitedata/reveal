/**
 * Status Icons
 */

import { CalculationStatusStatusEnum } from '@cognite/calculation-backend';
import { IconType, Icon } from '@cognite/cogs.js';

type Props = {
  status: CalculationStatusStatusEnum;
};

export const StatusIcon = ({ status }: Props) => {
  switch (status) {
    case CalculationStatusStatusEnum.Pending:
    case CalculationStatusStatusEnum.Running:
      return <Icon type="Loader" />;
    case CalculationStatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case CalculationStatusStatusEnum.Cancelled:
      return <Icon type="Warning" />;
    case CalculationStatusStatusEnum.Unknown:
      return <Icon type="Help" />;
    case CalculationStatusStatusEnum.Failed:
    case CalculationStatusStatusEnum.Error:
      return <Icon type="Error" title="Failed" />;
    default:
      return null;
  }
};

export function getIconTypeFromStatus(
  status: CalculationStatusStatusEnum
): IconType {
  switch (status) {
    case CalculationStatusStatusEnum.Pending:
    case CalculationStatusStatusEnum.Running:
      return 'Loader';
    case CalculationStatusStatusEnum.Success:
      return 'Checkmark';
    case CalculationStatusStatusEnum.Cancelled:
      return 'Warning';
    case CalculationStatusStatusEnum.Unknown:
      return 'Help';
    case CalculationStatusStatusEnum.Failed:
    case CalculationStatusStatusEnum.Error:
      return 'Error';
    default:
      return 'Cognite';
  }
}

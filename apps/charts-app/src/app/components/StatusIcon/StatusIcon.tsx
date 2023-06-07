/**
 * Status Icons
 */

import { StatusStatusEnum } from '@cognite/calculation-backend';
import { IconType, Icon } from '@cognite/cogs.js';

type Props = {
  status: StatusStatusEnum;
};

export const StatusIcon = ({ status }: Props) => {
  switch (status) {
    case StatusStatusEnum.Pending:
    case StatusStatusEnum.Running:
      return <Icon type="Loader" />;
    case StatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case StatusStatusEnum.Cancelled:
      return <Icon type="Warning" />;
    case StatusStatusEnum.Unknown:
      return <Icon type="Help" />;
    case StatusStatusEnum.Failed:
    case StatusStatusEnum.Error:
      return <Icon type="Error" title="Failed" />;
    default:
      return null;
  }
};

export function getIconTypeFromStatus(status: StatusStatusEnum): IconType {
  switch (status) {
    case StatusStatusEnum.Pending:
    case StatusStatusEnum.Running:
      return 'Loader';
    case StatusStatusEnum.Success:
      return 'Checkmark';
    case StatusStatusEnum.Cancelled:
      return 'Warning';
    case StatusStatusEnum.Unknown:
      return 'Help';
    case StatusStatusEnum.Failed:
    case StatusStatusEnum.Error:
      return 'Error';
    default:
      return 'Cognite';
  }
}

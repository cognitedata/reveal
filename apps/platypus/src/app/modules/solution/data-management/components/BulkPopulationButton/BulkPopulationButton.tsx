import { PropsWithChildren } from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { useDataManagementPageUI } from '../../hooks/useDataManagemenPageUI';

export interface BulkPopulationButtonProps extends PropsWithChildren {
  onClick?: () => void;
}

export const BulkPopulationButton = ({
  children,
  onClick,
}: BulkPopulationButtonProps) => {
  const { t } = useTranslation('BulkPopulationButton');
  const { getMissingPermissions } = useDataManagementPageUI();

  const missingPermissions = getMissingPermissions();

  return (
    <Tooltip
      disabled={missingPermissions.length === 0}
      content={`${t(
        'transformation-acl-message',
        'You do not have enough permissions to load data. Missing transformationsACL permissions:'
      )} [${missingPermissions}]`}
    >
      <Button
        disabled={missingPermissions.length > 0}
        icon="ExternalLink"
        iconPlacement="right"
        onClick={onClick}
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

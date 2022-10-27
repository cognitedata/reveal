import { Button, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useDataManagementPageUI } from '@platypus-app/modules/solution/data-management/hooks/useDataManagemenPageUI';
import { PropsWithChildren } from 'react';

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
      content={t(
        'transformation-acl-message',
        `You do not have enough permissions to load data. Missing permissions: [${missingPermissions}]`
      )}
    >
      <Button
        disabled={missingPermissions.length > 0}
        icon="ExternalLink"
        iconPlacement="right"
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip>
  );
};

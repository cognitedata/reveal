import { Body, Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../../hooks/useTranslation';
import { AccessAction, useAccessControl } from '../../../hooks';

type UpsertRuleFooterProps = {
  isLoading: boolean;
  okText: string;
  onCancel: VoidFunction;
  onOk: VoidFunction;
};

export const UpsertRuleFooter = ({
  isLoading,
  okText,
  onCancel,
  onOk,
}: UpsertRuleFooterProps) => {
  const { t } = useTranslation('UpsertRuleFooter');

  const { canWriteDataValidation, useErrorMessage } = useAccessControl();

  const accessErrorMessage = useErrorMessage(
    AccessAction.WRITE_DATA_VALIDATION
  );

  return (
    <Flex alignItems="flex-end" direction="column" gap={4}>
      <Flex direction="row" gap={8} justifyContent="flex-end">
        <Button disabled={isLoading} onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={isLoading || !canWriteDataValidation}
          loading={isLoading}
          onClick={onOk}
          type="primary"
        >
          {okText}
        </Button>
      </Flex>
      {!canWriteDataValidation && (
        <Flex style={{ textAlign: 'end' }}>
          <Body muted size="xx-small">
            {accessErrorMessage}
          </Body>
        </Flex>
      )}
    </Flex>
  );
};

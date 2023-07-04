import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Flex } from '@cognite/cogs.js';

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

  return (
    <Flex direction="row" gap={8} justifyContent="flex-end">
      <Button disabled={isLoading} onClick={onCancel}>
        {t('cancel', 'Cancel')}
      </Button>
      <Button
        disabled={isLoading}
        loading={isLoading}
        onClick={onOk}
        type="primary"
      >
        {okText}
      </Button>
    </Flex>
  );
};

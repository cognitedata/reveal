import { Button, toast } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { AppliedRule } from 'hooks/entity-matching-rules';
import { useUpdateAssetIds } from 'hooks/update';
import { SourceType } from 'types/api';

type Props = {
  rule: AppliedRule;
  sourceType: SourceType;
  predictJobId: number;
};

export default function ApplyButton({ rule, sourceType, predictJobId }: Props) {
  const { t } = useTranslation();
  const { mutate, isLoading, isSuccess, isError } = useUpdateAssetIds(
    sourceType,
    predictJobId,
    {
      onError(e) {
        toast.error(e.message);
      },
    }
  );

  const icon = (() => {
    if (isLoading) {
      return 'Loader';
    } else if (isSuccess) {
      return 'Checkmark';
    } else if (isError) {
      return 'Error';
    } else {
      return 'Save';
    }
  })();

  return (
    <Button
      type="primary"
      icon={icon}
      iconPlacement="right"
      disabled={isLoading}
      onClick={() =>
        mutate(
          rule.matches.map((m) => ({
            id: m.source.id,
            update: { assetId: { set: m.target.id } },
          }))
        )
      }
    >
      {t('rule-apply')}
    </Button>
  );
}

import { useTranslation } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { Warning } from '@transformations/hooks';
import { getSparkColumnType } from '@transformations/utils';

export type IncorrectTypeWarning = Warning & { type: 'incorrect-type' };

type IncorrectTypeWarningsProps = {
  isMultiple?: boolean;
  warnings: IncorrectTypeWarning[];
};

const IncorrectTypeWarnings = ({
  isMultiple,
  warnings,
}: IncorrectTypeWarningsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <InfoBox
      status="warning"
      title={
        isMultiple
          ? t('query-preview-tab-incorrect-type-warning-title', {
              count: warnings.length,
            })
          : undefined
      }
    >
      {t('query-preview-tab-incorrect-type-warning-description', {
        count: warnings.length,
        fields: warnings.map((c) => c.column),
        datatype:
          warnings.length === 1
            ? getSparkColumnType(warnings[0].schemaType)
            : undefined,
      })}
    </InfoBox>
  );
};

export default IncorrectTypeWarnings;

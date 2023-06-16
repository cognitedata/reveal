import { useTranslation } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { Warning } from '@transformations/hooks';

export type MissingColumnWarning = Warning & { type: 'column-missing' };

type MissingColumnWarningsProps = {
  isMultiple?: boolean;
  warnings: MissingColumnWarning[];
};

const MissingColumnWarnings = ({
  isMultiple,
  warnings,
}: MissingColumnWarningsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <InfoBox
      status="critical"
      title={
        isMultiple
          ? t('query-preview-tab-column-missing-warning-title', {
              count: warnings.length,
            })
          : undefined
      }
    >
      {t('query-preview-tab-column-missing-warning-description', {
        count: warnings.length,
        fields: warnings.map((c) => c.column),
      })}
    </InfoBox>
  );
};

export default MissingColumnWarnings;

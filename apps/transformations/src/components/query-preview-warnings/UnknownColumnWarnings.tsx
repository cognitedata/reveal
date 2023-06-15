import { useTranslation } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { Warning } from '@transformations/hooks';

export type UnknownColumnWarning = Warning & { type: 'unknown-column' };

type UnknownColumnWarningsProps = {
  isMultiple?: boolean;
  warnings: UnknownColumnWarning[];
};

const UnknownColumnWarnings = ({
  isMultiple,
  warnings,
}: UnknownColumnWarningsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <InfoBox
      status="undefined"
      title={
        isMultiple
          ? t('query-preview-tab-unknown-column-warning-title', {
              count: warnings.length,
            })
          : undefined
      }
    >
      {t('query-preview-tab-unknown-column-warning-description', {
        count: warnings.length,
        fields: warnings.map((c) => c.column),
      })}
    </InfoBox>
  );
};

export default UnknownColumnWarnings;

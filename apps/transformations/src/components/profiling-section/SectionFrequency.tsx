import { useTranslation } from '@transformations/common/i18n';
import { Section } from '@transformations/components/profiling-section';
import FrequencyStats, {
  Count,
} from '@transformations/containers/raw-preview-content/profiling/FrequencyStats';

type Props = {
  allCount: number;
  counts?: Count[];
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};
export const SectionFrequency = ({
  allCount,
  counts,
  title,
  isHalf,
  isCompact,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section
      title={title ?? t('frequency-analysis')}
      isCompact={isCompact}
      isHalf={isHalf}
    >
      {counts ? (
        <FrequencyStats allCount={allCount} counts={counts} />
      ) : (
        t('missing-summary')
      )}
    </Section>
  );
};

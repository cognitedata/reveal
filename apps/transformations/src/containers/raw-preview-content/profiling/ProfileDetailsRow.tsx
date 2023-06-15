import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import { Section } from '@transformations/components/profiling-section';
import {
  BooleanProfile,
  ColumnProfile,
} from '@transformations/hooks/profiling-service';

import { Flex, Colors } from '@cognite/cogs.js';

type Props = {
  allCount: number;
  profile: ColumnProfile;
};

export default function ProfileDetailsRow({ allCount, profile }: Props) {
  const columnType = profile.type;
  return (
    <tr key="profile-details">
      <td colSpan={9} style={{ padding: 0 }}>
        <ExpandedRow>
          {columnType === 'String' && (
            <ProfilingDataString profile={profile} allCount={allCount} />
          )}
          {columnType === 'Number' && (
            <ProfilingDataNumber profile={profile} allCount={allCount} />
          )}
          {columnType === 'Boolean' && (
            <ProfilingDataBoolean profile={profile} allCount={allCount} />
          )}
        </ExpandedRow>
      </td>
    </tr>
  );
}

const ProfilingDataString = ({ allCount, profile }: Props) => {
  const { distinctCount, counts, count, nullCount, min, max, histogram } =
    profile;
  const { t } = useTranslation();

  return (
    <>
      <Section title={t('numerical-statics')}>
        <StyledStatisticsRow direction="row" wrap="wrap">
          <NumberOrMissingSummary
            label={t('distinct-values')}
            value={distinctCount}
            isHalf={false}
          />
          <NumberOrMissingSummary label={t('non-empty')} value={count} />
          <NumberOrMissingSummary label={t('empty')} value={nullCount} />
          <NumberOrMissingSummary label={t('min-length')} value={min} />
          <NumberOrMissingSummary label={t('max-length')} value={max} />
        </StyledStatisticsRow>
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
      <Section.Distribution histogram={histogram} max={max} />
    </>
  );
};

const ProfilingDataNumber = ({ allCount, profile }: Props) => {
  const {
    distinctCount,
    counts,
    count,
    nullCount,
    min,
    max,
    mean,
    median,
    std,
    histogram,
  } = profile;
  const { t } = useTranslation();

  return (
    <>
      <Section title={t('numerical-statics')}>
        <StyledStatisticsRow direction="row" wrap="wrap">
          <NumberOrMissingSummary
            label={t('distinct-values')}
            value={distinctCount}
            isHalf={false}
          />
          <NumberOrMissingSummary label={t('non-empty')} value={count} />
          <NumberOrMissingSummary label={t('empty')} value={nullCount} />
          <NumberOrMissingSummary label={t('min')} value={min} />
          <NumberOrMissingSummary label={t('max')} value={max} />
          <NumberOrMissingSummary label={t('mean')} value={mean} />
          <NumberOrMissingSummary label={t('median')} value={median} />
          <NumberOrMissingSummary label={t('standard-deviation')} value={std} />
        </StyledStatisticsRow>
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
      <Section.Distribution histogram={histogram} max={max} />
    </>
  );
};

const ProfilingDataBoolean = ({ allCount, profile }: Props) => {
  const { counts, count, nullCount, profile: boolProfile } = profile;
  const { trueCount } = boolProfile as BooleanProfile;
  const falseCount = count - trueCount - nullCount;
  const { t } = useTranslation();

  return (
    <>
      <Section title={t('numerical-statics')}>
        <StyledStatisticsRow direction="row" wrap="wrap">
          <NumberOrMissingSummary label={t('true')} value={trueCount} />
          <NumberOrMissingSummary label={t('false')} value={falseCount} />
          <NumberOrMissingSummary label={t('non-empty')} value={count} />
          <NumberOrMissingSummary label={t('empty')} value={nullCount} />
        </StyledStatisticsRow>
      </Section>
      <Section.Frequency counts={counts} allCount={allCount} />
    </>
  );
};

const NumberOrMissingSummary = ({
  label,
  value,
  isHalf = true,
}: {
  label: string;
  value?: number;
  isHalf?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <StyledStatisticsItem isHalf={isHalf}>
      <header>{label}</header>
      {Number.isFinite(value) ? value : t('missing-summary')}
    </StyledStatisticsItem>
  );
};

const ExpandedRow = styled.div`
  border: 1px solid ${Colors['border--status-undefined--muted']};
  border-top: none;
  background-color: ${Colors['decorative--grayscale--100']};
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
`;

const StyledStatisticsRow = styled(Flex)`
  width: 100%;
`;
const StyledStatisticsItem = styled.div`
  flex: ${({ isHalf }: { isHalf: boolean }) =>
    isHalf ? '1 1 50%' : '1 1 100%'};
  padding: 8px 0px;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  header {
    display: block;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
  }
`;

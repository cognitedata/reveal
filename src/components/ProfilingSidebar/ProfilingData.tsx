import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Colors, Flex, Icon } from '@cognite/cogs.js';

import { useActiveTableContext } from 'contexts';
import { ColumnType } from 'hooks/table-data';
import {
  useColumnType,
  useQuickProfile,
  useFullProfile,
  StringProfile,
  NumberProfile,
  BooleanProfile,
  ColumnProfile,
} from 'hooks/profiling-service';

import Message from 'components/Message/Message';
import { Section, DATA_MISSING } from 'components/ProfilingSection';
import { useTranslation } from 'common/i18n';

type Props = { selectedColumn: ColumnType | undefined };

export const ProfilingData = ({ selectedColumn }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { database, table } = useActiveTableContext();
  const fullProfile = useFullProfile({
    database,
    table,
  });
  const limitProfile = useQuickProfile({
    database,
    table,
  });

  const {
    data = { columns: [] },
    isLoading,
    isError,
  } = fullProfile.isFetched ? fullProfile : limitProfile;

  const { getColumnType, isFetched } = useColumnType(database, table);

  const columnType = useMemo(
    () => (isFetched ? getColumnType(selectedColumn?.dataKey) : null),
    [getColumnType, selectedColumn, isFetched]
  );

  const { profile, ...columnProfilingData }: ColumnProfile = selectedColumn?.key
    ? data.columns?.find((p) => p.label === selectedColumn?.key) ??
      ({} as ColumnProfile)
    : ({} as ColumnProfile);

  return (
    <StyledProfilingData>
      {isLoading && (
        <Flex
          alignItems="center"
          justifyContent="center"
          style={{ width: '100%', padding: '20px' }}
        >
          <Icon type="Loader" />
        </Flex>
      )}
      {isError && (
        <Message
          message={t('profiling-sidebar-data-error-message')}
          type="error"
        />
      )}
      {columnType === 'String' && (
        <ColumnString
          data={columnProfilingData}
          profile={(profile as StringProfile) ?? null}
        />
      )}
      {columnType === 'Boolean' && (
        <ColumnBoolean
          data={columnProfilingData}
          profile={(profile as BooleanProfile) ?? null}
        />
      )}
      {columnType === 'Number' && (
        <ColumnNumber
          data={columnProfilingData}
          profile={(profile as NumberProfile) ?? null}
        />
      )}
    </StyledProfilingData>
  );
};

type BaseColumn = {
  data: Omit<ColumnProfile, 'profile'>;
};

interface PropsString extends BaseColumn {
  profile?: StringProfile | null;
}
const ColumnString = ({ data, profile }: PropsString) => {
  const { t } = useTranslation();
  if (!profile) return <span />;
  const { count, counts, nullCount, histogram, min, max } = data;

  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency allCount={count} counts={counts} isCompact />
      <Section.DistinctValues
        allCount={count + nullCount}
        distinctCount={profile.distinctCount}
        isCompact
      />
      <Section
        title={t('profiling-sidebar-section-title-non-empty')}
        isCompact
        isHalf
      >
        {count}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-empty')}
        isCompact
        isHalf
      >
        {nullCount}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-minimum-length')}
        isCompact
        isHalf
      >
        {min}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-maximum-length')}
        isCompact
        isHalf
      >
        {max}
      </Section>
      <Section.Distribution
        histogram={histogram}
        max={max}
        title={t('profiling-sidebar-section-title-char-length-distribution')}
        isCompact
      />
    </StyledProfilingDataWrapper>
  );
};

interface PropsBoolean extends BaseColumn {
  profile?: BooleanProfile | null;
}
const ColumnBoolean = ({ data, profile }: PropsBoolean) => {
  const { t } = useTranslation();
  if (!profile) return <span />;
  const { count, nullCount, counts } = data;
  const { trueCount = 0 } = profile;
  const falseCount = count - trueCount - nullCount;

  return (
    <StyledProfilingDataWrapper>
      <Section.Frequency allCount={count} counts={counts} isCompact />
      <Section
        title={t('profiling-sidebar-section-title-true')}
        isCompact
        isHalf
      >
        {Number(trueCount)}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-false')}
        isCompact
        isHalf
      >
        {falseCount}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-non-empty')}
        isCompact
        isHalf
      >
        {count}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-empty')}
        isCompact
        isHalf
      >
        {nullCount}
      </Section>
    </StyledProfilingDataWrapper>
  );
};

interface PropsNumber extends BaseColumn {
  profile?: NumberProfile | null;
}
const ColumnNumber = ({ data, profile }: PropsNumber) => {
  const { t } = useTranslation();
  if (!profile) return <span />;
  const { count, nullCount, histogram, min, max, mean, median, std } = data;
  const { distinctCount } = profile;

  return (
    <StyledProfilingDataWrapper>
      <Section.Distribution histogram={histogram} max={max} isCompact />
      <Section.DistinctValues
        allCount={count + nullCount}
        distinctCount={distinctCount}
        isCompact
      />
      <Section
        title={t('profiling-sidebar-section-title-non-empty')}
        isCompact
        isHalf
      >
        {count}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-empty')}
        isCompact
        isHalf
      >
        {nullCount}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-min')}
        isCompact
        isHalf
      >
        {min}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-max')}
        isCompact
        isHalf
      >
        {max}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-mean')}
        isCompact
        isHalf
      >
        {mean?.toFixed(1) ?? DATA_MISSING}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-median')}
        isCompact
        isHalf
      >
        {median?.toFixed(1) ?? DATA_MISSING}
      </Section>
      <Section
        title={t('profiling-sidebar-section-title-standard-deviation')}
        isCompact
      >
        {std?.toFixed(1) ?? DATA_MISSING}
      </Section>
    </StyledProfilingDataWrapper>
  );
};

const StyledProfilingData = styled.div`
  display: flex;
  width: 100%;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  flex-direction: column;
  flex: 1 1 auto;
  overflow: auto;
  border-bottom: none;
`;

const StyledProfilingDataWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

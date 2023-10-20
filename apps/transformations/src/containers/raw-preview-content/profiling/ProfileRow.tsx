import React, { useMemo, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import ColumnIcon from '@transformations/components/column-icon';
import { CustomIcon } from '@transformations/components/custom-icon';
import Tooltip from '@transformations/components/tooltip';
import {
  ColumnProfile,
  useColumnType,
} from '@transformations/hooks/profiling-service';
import { reduceHistogramBins } from '@transformations/utils';

import { Body, Button, Colors, Flex, Icon, Chip } from '@cognite/cogs.js';

import { Graph } from './Distribution';
import ProfileDetailsRow from './ProfileDetailsRow';

type ProfileRowDataType = 'Empty' | 'Distinct' | 'Min' | 'Max' | 'Mean';

const availableDataTypes: Record<
  ColumnProfile['type'] | 'Unknown',
  ProfileRowDataType[]
> = {
  Boolean: ['Empty'],
  Number: ['Empty', 'Distinct', 'Min', 'Max', 'Mean'],
  Object: ['Empty'],
  String: ['Empty', 'Distinct'],
  Vector: ['Empty'],
  Unknown: [],
};

type Props = {
  allCount: number;
  database: string;
  profile: ColumnProfile;
  table: string;
};

export default function ProfileRow({
  allCount,
  database,
  table,
  profile,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const {
    label,
    count = 0,
    nullCount = 0,
    distinctCount = 0,
    min,
    max,
    mean,
    histogram: rawHistogram,
  } = profile;

  const histogram = reduceHistogramBins(rawHistogram || [], 16);

  const { getColumnType, isFetched } = useColumnType(database, table);

  const getPercentage = (portion: number, total: number) => {
    const percentage = total === 0 ? 0 : (100 * portion) / total;
    let result;
    if (percentage === 0 || percentage === 100) {
      result = percentage;
    } else if (percentage > 0 && percentage < 10) {
      result = percentage.toFixed(2);
    } else {
      result = percentage.toFixed(1);
    }

    if (result === '0.00' && portion !== 0) {
      result = '0.01';
    } else if (result === '100.0' && portion !== total) {
      result = '99.9';
    }

    return result;
  };
  const getChipVariant = (percentage: number | string, type: string) => {
    if (type === 'empty') {
      if (percentage === 100) return 'danger';
      if (percentage === 0) return 'success';
    }
    if (type === 'distinct') {
      if (percentage === 100) return 'success';
    }
    return 'default';
  };
  const columnType = useMemo(
    () => (isFetched ? getColumnType(label) : undefined),
    [getColumnType, isFetched, label]
  );

  const emptyPercent = getPercentage(nullCount, count + nullCount);
  const distinctPercent = getPercentage(distinctCount, count + nullCount);

  return (
    <>
      <StyledTableRow key="profile" onClick={() => setExpanded(!expanded)}>
        <TableCell>
          <Flex justifyContent="center" style={{ width: '100%' }}>
            <ColumnIcon database={database} table={table} dataKey={label} />
          </Flex>
        </TableCell>
        <TableCell style={{ overflowWrap: 'anywhere' }}>{label}</TableCell>
        <TableCell>
          <NumberOrMissingTd
            dataType="Empty"
            columnType={columnType}
            value={nullCount}
          >
            <Chip
              size="x-small"
              label={`${emptyPercent}%`}
              type={getChipVariant(emptyPercent, 'empty')}
            />
          </NumberOrMissingTd>
        </TableCell>
        <TableCell>
          <NumberOrMissingTd
            dataType="Distinct"
            columnType={columnType}
            value={distinctCount}
          >
            <Chip
              size="x-small"
              label={`${distinctPercent}%`}
              type={getChipVariant(distinctPercent, 'distinct')}
            />
          </NumberOrMissingTd>
        </TableCell>
        <TableCell>
          {histogram && (
            <Graph
              distribution={histogram}
              height={30}
              maximumBarWidth={5}
              width={150}
              fill="rgba(140, 140, 140, 1)"
            />
          )}
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            dataType="Min"
            columnType={columnType}
            value={min}
          />
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            dataType="Max"
            columnType={columnType}
            value={max}
          />
        </TableCell>
        <TableCell numeric>
          <NumberOrMissingTd
            dataType="Mean"
            columnType={columnType}
            value={mean}
          />
        </TableCell>
        <TableCell>
          <Button
            aria-label={t('expand-row')}
            icon={expanded ? 'ChevronUp' : 'ChevronDown'}
            size="small"
            type="ghost"
          />
        </TableCell>
      </StyledTableRow>
      {expanded && <ProfileDetailsRow allCount={allCount} profile={profile} />}
    </>
  );
}

const NumberOrMissingTd = ({
  dataType,
  columnType,
  value,
  children,
}: {
  dataType: ProfileRowDataType;
  columnType?: ColumnProfile['type'] | 'key' | 'Unknown';
  value?: number;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const getIsDataAvailable = (): boolean => {
    if (!columnType) return false;
    if (columnType === 'key') return true;
    return availableDataTypes[columnType].includes(dataType);
  };
  const isDataAvailable = getIsDataAvailable();

  if (!isDataAvailable) {
    return (
      <StyledJustifyCenter>
        <Tooltip content={t('missing-data-info')}>
          <CustomIcon icon="NotAvailableIcon" style={{ width: 16 }} />
        </Tooltip>
      </StyledJustifyCenter>
    );
  }

  return Number.isFinite(value) ? (
    <>
      {value}
      <StyledChildrenWrapper>{children}</StyledChildrenWrapper>
    </>
  ) : (
    <StyledJustifyCenter>
      <Tooltip content={t('unavailable-data-info')}>
        <StyledInfoFilledIcon />
      </Tooltip>
    </StyledJustifyCenter>
  );
};

export type TableCellProps = {
  width?: number;
  numeric?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const TableCell = ({
  width,
  numeric,
  children,
  style,
}: TableCellProps) => {
  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: numeric ? 'flex-end' : 'space-between',
    alignItems: 'center',
  };
  return (
    <StyledTD $width={width} style={style} className="styled-cell">
      <Body className="styled-cell-content" level={2} strong style={bodyStyle}>
        {children}
      </Body>
    </StyledTD>
  );
};

const StyledTD = styled.td<{
  $width?: number;
  numeric?: boolean;
}>`
  padding: 0;
  width: ${({ $width }) => ($width !== undefined ? `${$width}px` : 'auto')};
  text-align: ${({ numeric }) => (numeric ? 'right' : 'left')};

  .styled-cell-content {
    padding: 8px 12px;
  }
`;

const StyledExpandButton = styled(Button)`
  display: none;
  position: absolute;
`;

const StyledTableRow = styled.tr`
  cursor: pointer;
  .styled-cell {
    border-bottom: 1px solid ${Colors['border--interactive--default']};
    border-left: 1px solid ${Colors['border--interactive--default']};
  }
  .styled-cell:last-child {
    border-right: 1px solid ${Colors['border--interactive--default']};
  }
  &:last-child {
    .styled-cell:first-child {
      border-radius: 0 0 0 4px;
    }
    .styled-cell:last-child {
      border-radius: 0 0 4px 0;
    }
  }
  &:hover {
    background-color: ${Colors['surface--strong']};

    ${StyledExpandButton} {
      display: block;
    }
  }
`;

const StyledJustifyCenter = styled(Flex)`
  width: 100%;
  justify-content: center;
`;

const StyledInfoFilledIcon = styled(Icon).attrs({
  size: 16,
  type: 'InfoFilled',
})`
  color: ${Colors['text-icon--muted']};
`;

const StyledChildrenWrapper = styled.div`
  margin-left: 8px;
`;
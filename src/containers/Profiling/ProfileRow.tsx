import React, { useMemo, useState } from 'react';

import { Body, Button, Colors, Flex, Icon, Label } from '@cognite/cogs.js';
import styled from 'styled-components';

import ColumnIcon from 'components/ColumnIcon';
import { CustomIcon } from 'components/CustomIcon';
import Tooltip from 'components/Tooltip/Tooltip';
import { useActiveTableContext } from 'contexts';
import {
  ColumnProfile,
  FULL_PROFILE_LIMIT,
  useColumnType,
} from 'hooks/profiling-service';

import { Graph } from './Distribution';
import ProfileDetailsRow from './ProfileDetailsRow';
import { reduceHistogramBins } from 'utils/utils';
import { useTranslation } from 'common/i18n';

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
  profile: ColumnProfile;
};

export default function ProfileRow({ allCount, profile }: Props) {
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

  const { database, table } = useActiveTableContext();
  const quickColumnTypes = useColumnType(database, table);
  const fullColumnTypes = useColumnType(database, table, FULL_PROFILE_LIMIT);
  const { getColumnType, isFetched } = fullColumnTypes.isFetched
    ? fullColumnTypes
    : quickColumnTypes;

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
  const getLabelVariant = (percentage: number | string, type: string) => {
    if (type === 'empty') {
      if (percentage === 100) return 'danger';
      if (percentage === 0) return 'success';
    }
    if (type === 'distinct') {
      if (percentage === 100) return 'success';
    }
    return 'unknown';
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
        <TableCell>{<ColumnIcon dataKey={label} />}</TableCell>
        <TableCell style={{ overflowWrap: 'anywhere' }}>{label}</TableCell>
        <TableCell>
          <NumberOrMissingTd
            dataType="Empty"
            columnType={columnType}
            value={nullCount}
          >
            <Label
              size="small"
              variant={getLabelVariant(emptyPercent, 'empty')}
            >
              {emptyPercent}%
            </Label>
          </NumberOrMissingTd>
        </TableCell>
        <TableCell>
          <NumberOrMissingTd
            dataType="Distinct"
            columnType={columnType}
            value={distinctCount}
          >
            <Label
              size="small"
              variant={getLabelVariant(distinctPercent, 'distinct')}
            >
              {distinctPercent}%
            </Label>
          </NumberOrMissingTd>
        </TableCell>
        <TableCell style={{ padding: '4px 4px 0' }}>
          {histogram && (
            <Graph
              distribution={histogram}
              height={40}
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
        <TableCell style={{ padding: '8px 16px' }}>
          <StyledExpandButton
            aria-label="Expand row"
            icon={expanded ? 'ChevronUp' : 'ChevronDown'}
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
  columnType?: ColumnProfile['type'] | 'Key' | 'Unknown';
  value?: number;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const getIsDataAvailable = (): boolean => {
    if (!columnType) return false;
    if (columnType === 'Key') return true;
    return availableDataTypes[columnType].includes(dataType);
  };
  const isDataAvailable = getIsDataAvailable();

  if (!isDataAvailable) {
    return (
      <StyledJustifyCenter>
        <Tooltip content={t('profiling-row-tooltip-information-not-available')}>
          <CustomIcon icon="NotAvailable" style={{ width: 16 }} />
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
      <Tooltip content={t('profiling-row-tooltip-error-not-available')}>
        <StyledInfoFilledIcon />
      </Tooltip>
    </StyledJustifyCenter>
  );
};

export const TableCell = ({ $width, numeric, children, style }: any) => {
  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: numeric ? 'flex-end' : 'space-between',
    alignItems: 'center',
  };
  return (
    <StyledTD $width={$width} style={style} className="styled-cell">
      <Body level={2} strong style={bodyStyle}>
        {children}
      </Body>
    </StyledTD>
  );
};

const StyledTD = styled.td<{
  $width?: number;
  numeric?: boolean;
}>`
  padding: 16px;
  width: ${({ $width }) => ($width !== undefined ? `${$width}px` : '')};
  text-align: ${({ numeric }) => (numeric ? 'right' : 'left')};
`;

const StyledExpandButton = styled(Button)`
  display: none;
  padding: 8px 10px !important; /* override cogs style */
`;

const StyledTableRow = styled.tr`
  cursor: pointer;
  .styled-cell {
    border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
    border-left: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
  .styled-cell:last-child {
    border-right: 1px solid ${Colors['greyscale-grey4'].hex()};
  }
  &:last-child {
    .styled-cell:first-child {
      border-radius: 0 0 0 8px;
    }
    .styled-cell:last-child {
      border-radius: 0 0 8px 0;
    }
  }
  &:hover {
    background-color: ${Colors['bg-accent'].hex()};

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
  color: ${Colors['text-hint'].hex()};
`;

const StyledChildrenWrapper = styled.div`
  margin-left: 8px;
`;

import { CellProps } from 'react-table';

import { StyledIcon } from './elements';

export const ExpanderCell = <T extends object>({
  row: {
    canExpand,
    isExpanded,
    depth,
    getToggleRowExpandedProps,
    original: {
      // @ts-expect-error very tricky to type this due to data appear only in depth 1
      watercourseName,
      // @ts-expect-error very tricky to type this due to data appear only in depth 1
      subRows: [{ sequenceExternalId }],
    },
  },
  cell,
}: CellProps<T, any>) => (
  <span style={{ paddingLeft: `${depth * 32}px` }}>
    {depth === 1 && (
      <label
        className="cogs-radio"
        htmlFor={watercourseName + sequenceExternalId}
      >
        <input
          type="radio"
          name={watercourseName}
          id={watercourseName + sequenceExternalId}
          value={sequenceExternalId}
        />
        <div className="radio-ui" />
      </label>
    )}
    <span {...getToggleRowExpandedProps()}>
      {canExpand && (
        <StyledIcon type={isExpanded ? 'ChevronDown' : 'ChevronRight'} />
      )}
      <span className={depth === 0 ? 'strong' : ''}>{cell.value}</span>
    </span>
  </span>
);

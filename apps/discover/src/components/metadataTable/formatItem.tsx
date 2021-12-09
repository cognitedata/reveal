/* eslint-disable react/no-array-index-key */
import compact from 'lodash/compact';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { Flex, Label, Tooltip } from '@cognite/cogs.js';

import { shortDate } from '_helpers/date';
import { getHumanReadableFileSize } from '_helpers/number';
import { EMPTY_FIELD_PLACEHOLDER } from 'constants/general';

import { EMPTY_COMMENT_PLACEHOLDER, EMPTY_PATH_PLACEHOLDER } from './constants';
import { EmptyCell } from './elements';
import { FilePath } from './formats/FilePath';
import { Text } from './formats/Text';

export interface FormatItemProps {
  value?: string | string[] | number | React.ReactNode[] | false | null;
  type?: 'text' | 'path' | 'filesize' | 'date' | 'label' | 'componentlist';
}

const maxLabels = 9;

export const formatItem = ({ value, type }: FormatItemProps) => {
  if (type === 'text') {
    return (
      <Text>{value || <EmptyCell>{EMPTY_COMMENT_PLACEHOLDER}</EmptyCell>}</Text>
    );
  }

  // If it's a path, wrap it in FilePath
  if (type === 'path') {
    return (
      <FilePath>
        {value || <EmptyCell>{EMPTY_PATH_PLACEHOLDER}</EmptyCell>}
      </FilePath>
    );
  }

  // If the value is empty, show the placeholder
  if (
    !value ||
    value === '' ||
    (isString(value) && value.toLowerCase() === 'unknown')
  ) {
    return <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>;
  }

  // In case it's an array, return them wrapped in labels
  if (isArray(value)) {
    // Filter out falsey values
    const compactArray: string[] | React.ReactNode[] = compact(value);

    return compactArray.length ? (
      <Flex gap={6} direction="row" wrap="wrap">
        {compactArray.slice(0, maxLabels).map((item, i) =>
          type === 'componentlist' ? (
            <span key={`${item?.toString()}${i}`}>{item}</span>
          ) : (
            <Label
              key={`${item?.toString()}${i}`}
              size="small"
              variant="unknown"
              selectable
            >
              {item}
            </Label>
          )
        )}
        {compactArray.length > maxLabels && (
          <Tooltip
            placement="bottom"
            content={
              <>
                {compactArray.slice(maxLabels).map((label) => (
                  <div key={label?.toString()}>{label}</div>
                ))}
              </>
            }
          >
            <Label
              icon="Add"
              iconPlacement="left"
              size="small"
              variant="unknown"
            >
              {value.length - maxLabels}
            </Label>
          </Tooltip>
        )}
      </Flex>
    ) : (
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  }

  // If it's a filesize, format it
  if (type === 'filesize') {
    return value && (isString(value) || isNumber(value)) ? (
      <>{getHumanReadableFileSize(value)}</>
    ) : (
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  }

  // If it's a datestring, format it
  if (type === 'date') {
    return value ? (
      <>{shortDate(value)}</>
    ) : (
      <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
    );
  }

  // If it's a label, wrap it in <Label>
  if (type === 'label' && isString(value)) {
    return (
      <Label variant="unknown" size="small">
        {value}
      </Label>
    );
  }

  // Otherwise, just return it
  return value ? (
    <>{value}</>
  ) : (
    <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
  );
};

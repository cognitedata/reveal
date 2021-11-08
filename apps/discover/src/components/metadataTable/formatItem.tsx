import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { Label } from '@cognite/cogs.js';

import { shortDate } from '_helpers/date';
import { getHumanReadableFileSize } from '_helpers/number';
import { EMPTY_FIELD_PLACEHOLDER } from 'constants/general';

import { EMPTY_COMMENT_PLACEHOLDER, EMPTY_PATH_PLACEHOLDER } from './constants';
import { EmptyCell } from './elements';
import { FilePath } from './formats/FilePath';
import { Text } from './formats/Text';

export interface FormatItemProps {
  value?: string | string[] | number | false | null;
  type?: 'text' | 'path' | 'filesize' | 'date' | 'label';
}

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
    return (
      <>
        {value.length ? (
          value.map((item) => (
            <Label key={item} size="small" variant="unknown">
              {item}
            </Label>
          ))
        ) : (
          <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
        )}
      </>
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

import { Warning, WARNING_TYPES } from '@transformations/hooks';

import { Flex } from '@cognite/cogs.js';

import IncorrectTypeWarnings, {
  IncorrectTypeWarning,
} from './IncorrectTypeWarnings';
import MissingColumnWarnings, {
  MissingColumnWarning,
} from './MissingColumnWarnings';
import UnknownColumnWarnings, {
  UnknownColumnWarning,
} from './UnknownColumnWarnings';

type QueryPreviewWarningsProps = {
  groupedWarnings: GroupedWarnings;
  isMultiple: boolean;
};

type GroupedWarnings = { [K in Warning['type']]: (Warning & { type: K })[] };

export const groupWarnings = (warnings: Warning[]): GroupedWarnings => {
  return {
    'column-missing': warnings?.filter(
      ({ type }) => type === 'column-missing'
    ) as MissingColumnWarning[],
    'incorrect-type': warnings?.filter(
      ({ type }) => type === 'incorrect-type'
    ) as IncorrectTypeWarning[],
    'unknown-column': warnings?.filter(
      ({ type }) => type === 'unknown-column'
    ) as UnknownColumnWarning[],
  };
};

export const isMultipleWarningType = (
  groupedWarnings: GroupedWarnings
): boolean => {
  return (
    Number(!!groupedWarnings['column-missing']?.length) +
      Number(!!groupedWarnings['incorrect-type']?.length) +
      Number(!!groupedWarnings['unknown-column']?.length) >
    1
  );
};

export const getMostUrgentWarningType = (
  warnings: Warning[]
): Warning['type'] | undefined => {
  return warnings.reduce((acc, cur) => {
    if (!acc || WARNING_TYPES[cur.type] > WARNING_TYPES[acc]) {
      return cur.type;
    }
    return acc;
  }, undefined as Warning['type'] | undefined);
};

const QueryPreviewWarnings = ({
  groupedWarnings,
}: QueryPreviewWarningsProps): JSX.Element => {
  const isMultiple = isMultipleWarningType(groupedWarnings);

  return (
    <Flex direction="column" gap={8}>
      {!!groupedWarnings['column-missing'].length && (
        <MissingColumnWarnings
          isMultiple={isMultiple}
          warnings={groupedWarnings['column-missing']}
        />
      )}
      {!!groupedWarnings['incorrect-type'].length && (
        <IncorrectTypeWarnings
          isMultiple={isMultiple}
          warnings={groupedWarnings['incorrect-type']}
        />
      )}
      {!!groupedWarnings['unknown-column'].length && (
        <UnknownColumnWarnings
          isMultiple={isMultiple}
          warnings={groupedWarnings['unknown-column']}
        />
      )}
    </Flex>
  );
};

export default QueryPreviewWarnings;

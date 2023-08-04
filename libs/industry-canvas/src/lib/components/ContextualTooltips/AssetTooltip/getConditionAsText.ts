import assertNever from '../../../utils/assertNever';

import { Condition } from './types';

const getConditionAsText = (condition: Condition): string => {
  switch (condition) {
    case Condition.EQUALS: {
      return '=';
    }

    case Condition.NOT_EQUALS: {
      return '≠';
    }

    case Condition.GREATER_THAN: {
      return '>';
    }

    case Condition.GREATER_THAN_OR_EQUAL: {
      return '≥';
    }

    case Condition.LESS_THAN: {
      return '<';
    }

    case Condition.LESS_THAN_OR_EQUAL: {
      return '≤';
    }

    default: {
      assertNever(condition);
    }
  }
};

export default getConditionAsText;

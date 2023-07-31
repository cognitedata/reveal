import { FileDirection } from '../types';

const getOppositeFileDirection = (
  fileDirection: FileDirection | undefined
): undefined | FileDirection => {
  if (fileDirection === undefined) return undefined;

  switch (fileDirection) {
    case 'In': {
      return 'Out';
    }

    case 'Out': {
      return 'In';
    }

    case 'Unidirectional': {
      return 'Unidirectional';
    }

    default: {
      return undefined;
    }
  }
};

export default getOppositeFileDirection;

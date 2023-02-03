import { CogniteError } from '@cognite/sdk';
import { FieldValues } from 'react-hook-form';

export const translateServerErrorMessage = <TFieldValues extends FieldValues>(
  data: CogniteError | undefined,
  errMsg: Record<string, string>
): { field: keyof TFieldValues; message: string } => {
  if (data?.message === 'Some externalIds persist in database') {
    return {
      field: 'externalId',
      message: errMsg['externalId'],
    };
  }
  if (data?.message.toLowerCase().includes('contact')) {
    return {
      field: 'contacts',
      message: errMsg['contacts'],
    };
  }
  return {
    field: 'server',
    message: errMsg['server'],
  };
};

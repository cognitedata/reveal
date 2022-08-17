import { FieldValues } from 'react-hook-form';
import { ErrorObj } from 'model/SDKErrors';

export const translateServerErrorMessage = <TFieldValues extends FieldValues>(
  data: ErrorObj | undefined,
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

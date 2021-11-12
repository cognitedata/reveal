import { FieldValues } from 'react-hook-form';
import { ErrorObj } from 'model/SDKErrors';
import { RegisterExtpipeInfo } from 'model/Extpipe';

export const translateServerErrorMessage = <TFieldValues extends FieldValues>(
  data: ErrorObj | undefined,
  info: Partial<RegisterExtpipeInfo>
): { field: keyof TFieldValues; message: string } => {
  if (data?.message === 'Some externalIds persist in database') {
    return {
      field: 'externalId',
      message: `External id: ${info.externalId} already exist. Update to a unique external id.`,
    };
  }
  if (data?.message.toLowerCase().includes('contact')) {
    return {
      field: 'contacts',
      message: `You must provide one contact with enabled notification`,
    };
  }
  return {
    field: 'server',
    message: data?.message ?? 'Ops an error occurred. Try again',
  };
};

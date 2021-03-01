import { ErrorObj } from '../../model/SDKErrors';
import { RegisterIntegrationInfo } from '../../model/Integration';

export const translateServerErrorMessage = (
  data: ErrorObj | undefined,
  info: Partial<RegisterIntegrationInfo>
): string => {
  if (data?.message === 'Some externalIds persist in database') {
    return `External id: ${info.externalId} already exist. Update to a unique external id.`;
  }
  if (data?.message.toLowerCase().includes('contact')) {
    return `You must provide one contact with enabled notification`;
  }
  return data?.message ?? 'Ops an error occurred. Try again';
};

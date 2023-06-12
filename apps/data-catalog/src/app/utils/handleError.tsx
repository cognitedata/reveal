import { toast } from '@cognite/cogs.js';

interface ApiError {
  duplicated: [];
  errors: any[];
  failed: any[];
  missing: [];
  requestId: undefined;
  requestIds: [];
  responses: [];
  status: number;
  statuses: any[];
  succeeded: [];
}

interface ErrorNotificationProps extends ApiError {
  description?: string;
}

// TODO CDFUX-1573 - figure out translation
const generateStatusMessage = (errorCode: number): string | null => {
  switch (errorCode) {
    case 401:
      return 'Your account has insufficient access rights. Please contact your project administrator.';
    case 404:
    case 403:
      return 'You have insufficient access rights to create a data set. Please contact your project administrator for necessary access and try again.';
    case 409:
      return 'External ID cannot be a duplicate. Please choose another external ID.';
    case 500:
    case 503:
      return 'Something went wrong. Please try again in a bit.';
    case undefined:
      return 'We experienced a network issue while handling your request. Please make sure you are connected to the internet and try again.';
    default:
      return null;
  }
};

const generateErrorDescription = (
  error: ApiError,
  customDescription?: string
) => {
  const httpError = generateStatusMessage(error.status);
  const errorMsgs = error.errors?.map((err) => err?.message) ?? null;
  // TODO CDFUX-1573 - figure out translation
  const genericError = `Something went wrong. Please contact Cognite support if the error persists. Error code: ${error.status}`;

  const description =
    customDescription ?? httpError ?? errorMsgs ?? genericError;
  return <strong>{description}</strong>;
};

export const handleError = (props: ErrorNotificationProps): void => {
  const { description } = props;
  const errorObject: ApiError = { ...props };

  // TODO CDFUX-1573 - figure out translation
  const errorTitle = 'Something went wrong';
  const errorDescription = generateErrorDescription(errorObject, description);

  toast.error(
    <div>
      <h3>{errorTitle}</h3>
      {errorDescription}
    </div>
  );
};

export default handleError;

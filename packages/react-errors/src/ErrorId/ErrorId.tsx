import { Detail } from '@cognite/cogs.js';

import { ReportedError } from '../reportException';

type IdProps = { id: string };
type ErrorProps = { error: ReportedError };

type Props = IdProps | ErrorProps;

const isReportedErrorProps = (props: Props): props is ErrorProps =>
  !!(props as ErrorProps).error;

const ErrorId = (props: Props) => {
  const id = isReportedErrorProps(props) ? props.error.errorId : props.id;

  return (
    <div>
      <Detail>Error ID: {id}</Detail>
    </div>
  );
};

export default ErrorId;

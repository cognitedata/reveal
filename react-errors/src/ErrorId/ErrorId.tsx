import React from 'react';
import { Detail } from '@cognite/cogs.js';
import { Trans, useTranslation } from 'react-i18next';
import { withI18nSuspense } from '@cognite/react-i18n';

import { ReportedError } from '../reportException';

type IdProps = { id: string };
type ErrorProps = { error: ReportedError };

type Props = IdProps | ErrorProps;

const isReportedErrorProps = (props: Props): props is ErrorProps => {
  return !!(props as ErrorProps).error;
};

const ErrorId = (props: Props) => {
  const id = isReportedErrorProps(props) ? props.error.errorId : props.id;

  const { t } = useTranslation('ErrorId');
  return (
    <div>
      <Detail>
        <Trans t={t} i18nKey="errorId">
          Error ID: {{ id }}
        </Trans>
      </Detail>
    </div>
  );
};

export default withI18nSuspense(ErrorId);

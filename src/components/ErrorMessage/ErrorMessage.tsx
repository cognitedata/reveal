import { FunctionComponent, PropsWithChildren } from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useTranslation } from 'common/i18n';

export interface DataSetError {
  status: number;
  message: string;
  missing?: { id: number }[];
}

interface ErrorMessageProps {
  error?: DataSetError | null;
}

export const ErrorMessageBox = ({ children }: PropsWithChildren<{}>) => {
  return (
    <ErrorWrapper className="z-4">
      <StyledIcon type="Warning" />
      {children}
    </ErrorWrapper>
  );
};

export const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({
  error,
}: ErrorMessageProps) => {
  const { t } = useTranslation();

  const generateStatusMessage = (dataSetError: DataSetError) => {
    if (dataSetError.status === 400) {
      const missingIds = dataSetError.missing?.map((m) => m.id).join(', ');
      return dataSetError.missing?.length
        ? t('data-set-with-id-not-found', { datasetId: missingIds })
        : dataSetError.message;
    }
    return dataSetError.message;
  };

  return error ? (
    <ErrorMessageBox>{generateStatusMessage(error)}</ErrorMessageBox>
  ) : null;
};

const ErrorWrapper = styled.div`
  padding: 2rem;
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  margin-right: 1rem;
  color: ${Colors.warning.hex()};
`;

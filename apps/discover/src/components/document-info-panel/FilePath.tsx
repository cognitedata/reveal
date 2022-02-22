import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { MetadataItem } from 'components/metadataTable';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { setObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import { FlexColumn, FlexRow } from 'styles/layout';

import {
  FilePathContainer,
  PathContainer,
  PathText,
  ReportIssueText,
  PathHeader,
} from './elements';

export interface FilePathProps {
  paths: string[] | undefined;
  documentId: string;
}

export const FilePath: React.FC<FilePathProps> = ({ paths, documentId }) => {
  const dispatch = useDispatch();
  const metrics = useGlobalMetrics('feedback');
  const { t } = useTranslation('Documents');

  if (!paths || paths.length < 1) {
    return null;
  }

  const onOpenFeedback = () => {
    dispatch(setObjectFeedbackModalDocumentId(documentId));
    metrics.track('click-report-invalid-document-path-button');
  };

  const renderReportIssueButton = () => (
    <ReportIssueText onClick={onOpenFeedback} aria-hidden="true">
      Report the issue
    </ReportIssueText>
  );

  const isEveryFilePathsEmpty = paths.every((path) => !path);
  if (isEveryFilePathsEmpty) {
    return (
      <FilePathContainer>
        <FlexColumn>
          <PathContainer showCursor={false}>
            <FlexRow>
              <PathText>
                All paths ({paths.length + 1}) are invalid.{' '}
                {renderReportIssueButton()}
              </PathText>
            </FlexRow>
          </PathContainer>
        </FlexColumn>
      </FilePathContainer>
    );
  }

  return (
    <FilePathContainer>
      <FlexColumn>
        <PathHeader>
          {`${t('Original path')}${paths.length === 1 ? '' : 's'}`}
        </PathHeader>
        {paths.map((path) => (
          <span key={`${path}`} data-testid="document-parent-path">
            <MetadataItem value={path} type="path" spacing="small" />
          </span>
        ))}
      </FlexColumn>
    </FilePathContainer>
  );
};

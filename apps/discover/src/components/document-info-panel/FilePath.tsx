import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { convertPath } from '_helpers/path';
import { Tooltip } from 'components/tooltip';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { setObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import { FlexColumn, FlexGrow, FlexRow } from 'styles/layout';

import {
  FilePathContainer,
  PathContainer,
  CopyIcon,
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
  const title = t('Copy to clipboard');
  const [tooltipTitle, setTooltipTitle] = useState(title);

  if (!paths || paths.length < 1) {
    return null;
  }

  const onOpenFeedback = () => {
    dispatch(setObjectFeedbackModalDocumentId(documentId));
    metrics.track('click-report-invalid-document-path-button');
  };

  const handleCopyToClipboard = (_text: string, result: boolean) => {
    metrics.track('click-copy-document-title-button');

    if (result) {
      setTooltipTitle(t('Copied'));
      setTimeout(() => setTooltipTitle(title), 1000);
    } else {
      setTooltipTitle(t('Unable to copy path to clipboard'));
      setTimeout(() => setTooltipTitle(title), 4000);
    }
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
        <PathHeader>{t('Original path')}</PathHeader>
        {paths.map((path, index) => (
          <Tooltip
            title={tooltipTitle}
            key={path + index || Math.random()}
            placement="right"
            enabled={!!path}
          >
            <CopyToClipboard
              text={convertPath(path)}
              onCopy={handleCopyToClipboard}
            >
              <PathContainer showCursor data-testid="document-parent-path">
                <FlexRow>
                  <PathText>
                    {path ? (
                      <>{path}</>
                    ) : (
                      <>Invalid path. {renderReportIssueButton()}</>
                    )}
                  </PathText>
                  <FlexGrow />
                  <CopyIcon type="Copy" />
                </FlexRow>
              </PathContainer>
            </CopyToClipboard>
          </Tooltip>
        ))}
      </FlexColumn>
    </FilePathContainer>
  );
};

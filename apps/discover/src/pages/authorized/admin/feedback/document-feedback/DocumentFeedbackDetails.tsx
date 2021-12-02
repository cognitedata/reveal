import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Tooltip } from '@cognite/cogs.js';

import MetadataTable, { MetadataItem } from 'components/metadataTable';
import {
  setObjectFeedbackSensitivityByAdmin,
  useFeedbackUpdateMutate,
} from 'modules/api/feedback';
import { ASSESS } from 'modules/feedback/constants';
import { generateReplyToUserContent } from 'modules/feedback/helper';
import { DocumentFeedbackItem } from 'modules/feedback/types';
import { MarginBottomNormalContainer } from 'styles/layout';

import { AssessDropdown } from '../common/AssessDropdown';
import {
  DocumentFeedbackDetailsWrapper,
  SensitiveWarning,
  SensitiveWarningText,
  TableDropdown,
} from '../elements';

interface Props {
  feedback: DocumentFeedbackItem;
  // deleted?: boolean;
}

interface BaseProps {
  feedback: DocumentFeedbackItem;
  action?: React.ReactElement;
}

interface DeletedProps {
  feedback: DocumentFeedbackItem;
}

const BaseDocumentFeedbackDetails: React.FC<BaseProps> = (props) => {
  const { mutateAsync: updateObjectFeedbackSensitive } =
    useFeedbackUpdateMutate('sensitive');
  const { feedback, action } = props;

  const initialAssessment = feedback?.isSensitiveByAdmin
    ? ASSESS.Approve
    : undefined;

  const [assessment, setAssessment] = React.useState<ASSESS | undefined>(
    initialAssessment
  );
  const { t } = useTranslation('Admin');

  const handleChangeAssessment = (nextAssessment: number) => {
    setObjectFeedbackSensitivityByAdmin(
      feedback.id,
      nextAssessment === ASSESS.Approve,
      updateObjectFeedbackSensitive
    );
    setAssessment(nextAssessment);
  };

  const handleClearAssessment = () => {
    // Currently there's no way in the API to undo the assessment.
    // When that's fixed, we can enable this: – Ronald
    /*
    setObjectFeedbackSensitivityByAdmin(
      feedback.id,
      undefined,
      updateObjectFeedbackSensitive
    );
    */
    setAssessment(undefined);
  };
  return (
    <TableDropdown>
      {feedback.isSensitiveData && (
        <SensitiveWarning
          resolved={
            assessment !== undefined ||
            feedback.isSensitiveByAdmin !== undefined
          }
        >
          <SensitiveWarningText>
            {t('This document was marked as sensitive')}
          </SensitiveWarningText>
          <AssessDropdown
            assessment={assessment}
            clearAssessment={handleClearAssessment}
            handleChangeAssessment={handleChangeAssessment}
          />
        </SensitiveWarning>
      )}

      <DocumentFeedbackDetailsWrapper>
        <MetadataItem
          label={t('Original path')}
          value={feedback.fileLocation}
          type="path"
        />
        <MetadataTable
          columns={2}
          metadata={[
            { label: t('File name'), value: feedback.fileName },
            { label: t('Feedback ID'), value: feedback.id },
            {
              label: t('Current document type'),
              value: feedback?.originalType,
              type: 'label',
            },
            {
              label: t('Suggested document type'),
              value: feedback?.suggestedType,
              type: 'label',
            },
          ]}
        />
        <MarginBottomNormalContainer>
          <MetadataItem
            label={t('User comment')}
            value={feedback.comment}
            type="text"
          />
        </MarginBottomNormalContainer>
        {action}
      </DocumentFeedbackDetailsWrapper>
    </TableDropdown>
  );
};

export const DeletedDocumentFeedbackDetails: React.FC<DeletedProps> = (
  props
) => {
  const { feedback } = props;
  return (
    <BaseDocumentFeedbackDetails feedback={feedback}>
      {/* {feedback.isSensitiveData && (
        <Assessment feedback={feedback} data-testid="dropdown-assessment" />
      )} */}
    </BaseDocumentFeedbackDetails>
  );
};

export const DocumentFeedbackDetails: React.FC<Props> = (props) => {
  const { feedback } = props;
  const { t } = useTranslation();

  const handleReplyToUser = () => {
    const content = generateReplyToUserContent(feedback);
    if (content) {
      window.location.href = content;
    }
  };

  const action = (
    <Tooltip
      content={
        feedback.user
          ? t('Send a reply to the author by email')
          : t('You cannot respond to this feedback because author is unknown.')
      }
      placement="bottom"
    >
      <Button
        type="tertiary"
        size="small"
        onClick={handleReplyToUser}
        disabled={!feedback.user}
      >
        {t('Reply to user')}
      </Button>
    </Tooltip>
  );

  return <BaseDocumentFeedbackDetails feedback={feedback} action={action} />;
};

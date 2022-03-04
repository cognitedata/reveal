import React from 'react';
import { useTranslation } from 'react-i18next';

import { useDocumentSearchOneQuery } from 'services/documentSearch/useDocumentSearchOneQuery';
import {
  setObjectFeedbackSensitivityByAdmin,
  useFeedbackUpdateMutate,
} from 'services/feedback';

import { Button, Tooltip } from '@cognite/cogs.js';
import { ObjectFeedbackResponse } from '@cognite/discover-api-types';

import { Loading } from 'components/loading';
// import { Metadata } from 'components/document-preview';
import MetadataTable, { MetadataItem } from 'components/metadataTable';
import { ASSESS } from 'modules/feedback/constants';
import { generateReplyToUserContent } from 'modules/feedback/helper';
import { MarginBottomNormalContainer } from 'styles/layout';

import { AssessDropdown } from '../common/AssessDropdown';
import {
  DocumentFeedbackDetailsWrapper,
  SensitiveWarning,
  SensitiveWarningText,
  TableDropdown,
} from '../elements';

import { DocumentFeedbackDocumentTypeActions } from './DocumentFeedbackDocumentTypeActions';

interface Props {
  feedback: ObjectFeedbackResponse;
  // deleted?: boolean;
}

interface BaseProps {
  feedback: ObjectFeedbackResponse;
  action?: React.ReactElement;
}

interface DeletedProps {
  feedback: ObjectFeedbackResponse;
}

const BaseDocumentFeedbackDetails: React.FC<BaseProps> = (props) => {
  const { mutateAsync: updateObjectFeedbackSensitive } =
    useFeedbackUpdateMutate('sensitive');
  const { feedback, action } = props;
  const { data: doc } = useDocumentSearchOneQuery(Number(feedback.documentId));
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

  if (!doc) {
    return <Loading />;
  }

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
          value={feedback.fileLocation || doc?.fullFilePath}
          type="path"
        />
        <MetadataTable
          columns={3}
          metadata={[
            { label: t('Document title'), value: doc?.title },
            { label: t('Feedback ID'), value: feedback.id },
            {
              label: t('Current document type'),
              value: feedback?.originalType,
              type: 'label',
            },
          ]}
        />
        {/* 
        We need to consider adding all the metadata here, 
        instead of a custom display:
          {doc && (
            <Metadata doc={doc} numberOfColumns={4} hidelist={['assets']} />
          )} 
        */}
        {feedback?.suggestedType && !feedback?.suggestedTypeLabelId && (
          <MarginBottomNormalContainer>
            <MetadataItem
              label={t('Suggested document type')}
              value="Feedback is outdated. Please archive this feedback"
              type="text"
            />
          </MarginBottomNormalContainer>
        )}

        {feedback?.suggestedType && feedback?.suggestedTypeLabelId && (
          <MarginBottomNormalContainer>
            <MetadataItem
              label={t('Suggested document type')}
              value={feedback.suggestedType}
              type="text"
              actions={
                <DocumentFeedbackDocumentTypeActions
                  documentId={feedback.documentId}
                  originalDocumentType={feedback?.originalType}
                  suggestedDocumentType={{
                    label: feedback.suggestedType,
                    value: feedback.suggestedTypeLabelId,
                  }}
                  userId={feedback?.user?.id || 'unknown'}
                />
              }
            />
          </MarginBottomNormalContainer>
        )}

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

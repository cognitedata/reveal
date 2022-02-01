import React, { useEffect } from 'react';

import styled from 'styled-components/macro';

import { Body, Button, Flex, Tooltip } from '@cognite/cogs.js';

import { ModalConfirm } from 'components/modals/confirm/ModalConfirm';
import { usePermissions } from 'hooks/usePermissions';
import { useFeedbackDocumentStatus } from 'modules/documentFeedback/hooks';
import { useDocumentFeedbackMutate } from 'modules/documentFeedback/mutate';
import { DocumentFeedbackType } from 'modules/documentFeedback/types';

import { SmallGreyLabel } from '../elements';

const Container = styled.div`
  display: flex;
  gap: 8px;
`;

interface Props {
  documentId: string;
  originalDocumentType?: string;
  suggestedDocumentType: { label: string; value: string };
  userId: string;
}
export const DocumentFeedbackDocumentTypeActions: React.FC<Props> = ({
  documentId,
  originalDocumentType,
  suggestedDocumentType,
  userId,
}) => {
  const approvalRights = usePermissions({
    documentFeedbackAcl: ['READ', 'DELETE', 'CREATE'],
    labelsAcl: ['READ'],
    filesAcl: ['WRITE'],
  });

  const rejectRights = usePermissions({
    documentFeedbackAcl: ['READ', 'DELETE', 'CREATE'],
  });

  const { assessed, status, loading } = useFeedbackDocumentStatus(
    Number(documentId),
    suggestedDocumentType.value
  );

  const [beenAssessed, setBeenAssessed] = React.useState(assessed);
  useEffect(() => {
    setBeenAssessed(assessed);
  }, [assessed]);

  const assessment = useDocumentFeedbackMutate();

  const performAssessment = (type: DocumentFeedbackType) => {
    assessment.mutate({
      type,
      documentId: Number(documentId),
      label: { externalId: suggestedDocumentType.value },
      action: 'ATTACH',
      reporterInfo: userId,
    });
  };

  const handleApproveClick = () => {
    performAssessment('accept');
  };

  const handleRejectClick = () => {
    performAssessment('reject');
  };

  if (loading) {
    return null;
  }

  if (beenAssessed) {
    return (
      <Container>
        <Button disabled size="small">
          {status}
        </Button>

        {/* 
        Re-enable this in the future.
        <Button
          type="ghost"
          size="small"
          onClick={() => setBeenAssessed(false)}
        >
          Re-assess
        </Button> */}
      </Container>
    );
  }

  return (
    <Tooltip
      content="Your account does not have privileges to perform this action"
      disabled={!approvalRights}
    >
      <Container>
        <ModalConfirm
          title="Approve suggested document type"
          disabled={!!approvalRights}
          content={
            <Flex gap={4} direction="column">
              <Body level={2}>
                By confirming this action you will replace the current document
                type:
              </Body>
              <Body level={2}>
                <SmallGreyLabel>
                  {originalDocumentType || 'unknown'}
                </SmallGreyLabel>{' '}
                with{' '}
                <SmallGreyLabel>{suggestedDocumentType.label}</SmallGreyLabel>
              </Body>
            </Flex>
          }
        >
          <Button
            type="primary"
            size="small"
            disabled={!!approvalRights && !assessed}
            onClick={handleApproveClick}
          >
            Approve
          </Button>
        </ModalConfirm>

        <ModalConfirm
          title="Decline suggested document type"
          disabled={!!approvalRights}
          content={
            <Flex gap={4} direction="column">
              <Body level={2}>
                By declining this action you will keep the current document
                type:
              </Body>
              <Body level={2}>
                <SmallGreyLabel>
                  {originalDocumentType || 'unknown'}
                </SmallGreyLabel>
              </Body>
            </Flex>
          }
        >
          <Button
            type="secondary"
            size="small"
            disabled={!!rejectRights}
            onClick={handleRejectClick}
          >
            Decline
          </Button>
        </ModalConfirm>
      </Container>
    </Tooltip>
  );
};

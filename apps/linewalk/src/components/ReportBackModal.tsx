import { Button, Modal, Textarea } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import React, { useState } from 'react';

import { DocumentType, ParsedDocument } from '../modules/lineReviews/types';

import exportDocumentsToPdf from './LineReviewViewer/exportDocumentsToPdf';
import getUniqueDocumentsByDiscrepancy from './LineReviewViewer/getUniqueDocumentsByDiscrepancy';
import { Discrepancy } from './LineReviewViewer/LineReviewViewer';
import mapPidAnnotationIdsToIsoAnnotationIds from './LineReviewViewer/mapPidAnnotationIdsToIsoAnnotationIds';

type Props = {
  documents: ParsedDocument[];
  discrepancies: Discrepancy[];
  onCancelPress: () => void;
  ornateRef: CogniteOrnate;
  onSave: ({ comment }: { comment: string }) => void;
  initialComment: string | undefined;
  isOpen: boolean;
};

const ReportBackModal: React.FC<Props> = ({
  documents,
  ornateRef,
  discrepancies,
  isOpen,
  onCancelPress,
  onSave,
  initialComment,
}) => {
  const [comment, onCommentChange] = useState(initialComment ?? '');

  if (!isOpen) {
    return null;
  }

  return (
    <Modal visible onCancel={onCancelPress} footer={null}>
      <h2>Report back</h2>
      <p>
        You are about to send this report for further checking. The following
        discrepancies will be included in the report:
      </p>

      {discrepancies.length === 0 && (
        <p>
          <b>No discrepancies marked yet</b>
        </p>
      )}

      {discrepancies.map((discrepancy) => {
        const uniqueDiscrepancyIsos = getUniqueDocumentsByDiscrepancy(
          documents,
          mapPidAnnotationIdsToIsoAnnotationIds(documents, discrepancy.ids)
        ).filter((document) => document.type === DocumentType.ISO);
        const usedDiscrepancyIsos =
          uniqueDiscrepancyIsos.length === 0
            ? documents.filter((document) => document.type === DocumentType.ISO)
            : uniqueDiscrepancyIsos;
        return (
          <div key={discrepancy.id}>
            <div>
              <b>{discrepancy.comment}</b>
            </div>

            <div>
              <b>MF:</b>{' '}
              {getUniqueDocumentsByDiscrepancy(documents, discrepancy.ids)
                .filter((document) => document.type === DocumentType.PID)
                .map((document) => (
                  <React.Fragment key={document.externalId}>
                    <a //eslint-disable-line
                      onClick={() => {
                        return undefined;
                      }}
                    >
                      {document.pdfExternalId}
                    </a>{' '}
                  </React.Fragment>
                ))}
            </div>
            <div>
              <b>ISO:</b>{' '}
              {usedDiscrepancyIsos
                .filter((document) => document.type === DocumentType.ISO)
                .map((document) => (
                  <React.Fragment key={document.externalId}>
                    <a //eslint-disable-line
                      onClick={() => {
                        return undefined;
                      }}
                    >
                      {document.pdfExternalId}
                    </a>{' '}
                  </React.Fragment>
                ))}
            </div>
            <br />
          </div>
        );
      })}

      <br />
      <Textarea
        placeholder="Comments..."
        style={{ width: '100%' }}
        value={comment}
        onChange={(event) => onCommentChange(event.target.value)}
      />
      <br />
      <br />
      <footer>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button
              type="ghost"
              icon="Print"
              onClick={() =>
                ornateRef
                  ? exportDocumentsToPdf(ornateRef, documents, discrepancies)
                  : undefined
              }
            />
          </div>
          <div>
            <Button type="secondary" onClick={onCancelPress}>
              Cancel
            </Button>
            &nbsp;&nbsp;
            <Button type="primary" onClick={() => onSave({ comment })}>
              Save
            </Button>
          </div>
        </div>
      </footer>
    </Modal>
  );
};

export default ReportBackModal;

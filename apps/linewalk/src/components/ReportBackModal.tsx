import { Button, Modal, Textarea } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import keyBy from 'lodash/keyBy';
import uniq from 'lodash/uniq';
import React, { useState } from 'react';

import { DocumentType, WorkspaceDocument } from '../modules/lineReviews/types';

import exportDocumentsToPdf from './LineReviewViewer/exportDocumentsToPdf';
import getKonvaSelectorSlugByExternalId from './LineReviewViewer/getKonvaSelectorSlugByExternalId';
import { Discrepancy } from './LineReviewViewer/LineReviewViewer';

type Props = {
  documents: WorkspaceDocument[];
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

  const workspaceDocumentsBySlugPdfExternalId = keyBy(documents, (document) =>
    getKonvaSelectorSlugByExternalId(document.pdfExternalId)
  );

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

      {discrepancies.map((discrepancy, index) => {
        const targetDocuments = uniq(
          discrepancy.annotations.map(
            (annotation) =>
              workspaceDocumentsBySlugPdfExternalId[annotation.targetExternalId]
          )
        );

        const pidDocuments = targetDocuments.filter(
          (document) => document.type === DocumentType.PID
        );

        const isoDocuments = targetDocuments.filter(
          (document) => document.type === DocumentType.ISO
        );

        return (
          <div key={discrepancy.id}>
            <div>
              <b>
                [{index + 1}]:{' '}
                {discrepancy.comment === ''
                  ? '(No comment specified)'
                  : discrepancy.comment}
              </b>
            </div>
            <div>
              <b>MF:</b>{' '}
              {pidDocuments
                .map((document) => document.pdfExternalId)
                .join(', ')}
              {pidDocuments.length === 0 && '(No PID documents)'}
            </div>
            <div>
              <b>ISO:</b>{' '}
              {isoDocuments
                .map((document) => document.pdfExternalId)
                .join(', ')}
              {isoDocuments.length === 0 && ' (No ISO documents)'}
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

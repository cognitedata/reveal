import { CogniteOrnate, downloadURL, OrnatePDFDocument } from '@cognite/ornate';
import { PDFDocument } from 'pdf-lib';
import Konva from 'konva';
import sortBy from 'lodash/sortBy';
import { DiagramType } from '@cognite/pid-tools';

import { WorkspaceDocument } from '../../modules/lineReviews/types';

import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import { Discrepancy, DiscrepancyAnnotation } from './LineReviewViewer';

const isDiscrepancyAnnotationInDocument = (
  ornateRef: CogniteOrnate,
  annotation: DiscrepancyAnnotation,
  document: WorkspaceDocument
) => {
  const node = ornateRef.stage.findOne(`#${annotation.nodeId}`);
  if (node === undefined) {
    return false;
  }

  return (
    getKonvaSelectorSlugByExternalId(document.pdfExternalId) ===
    node.getParent().id()
  );
};

const exportDocumentsToPdf = async (
  ornateRef: CogniteOrnate,
  documents: WorkspaceDocument[],
  discrepancies: Discrepancy[] = [],
  fileName = 'LineReview.pdf'
) => {
  const pdf = await PDFDocument.create();

  const sortedDocuments = [
    ...sortBy(
      documents.filter((document) => document.type === DiagramType.PID),
      (document) => document.pdfExternalId
    ),
    ...sortBy(
      documents.filter((document) => document.type === DiagramType.ISO),
      (document) => document.pdfExternalId
    ),
  ];

  const documentOrnateDocumentTuples = sortedDocuments.map<
    [WorkspaceDocument, OrnatePDFDocument]
  >((document) => {
    const ornateDocument = ornateRef.documents.find(
      (ornateDocument) =>
        ornateDocument.group.id() ===
        getKonvaSelectorSlugByExternalId(document.pdfExternalId)
    );
    if (ornateDocument === undefined) {
      throw new Error('No such document');
    }

    return [document, ornateDocument];
  });

  const annotatedPIDs = documentOrnateDocumentTuples.map(
    async ([document, ornateDocument]) => {
      const isHidden = !ornateDocument.kImage.visible();

      if (isHidden) {
        ornateDocument.kImage.show();
      }
      const clonedGroup = ornateDocument.group.clone();

      clonedGroup
        .findOne(
          `#opacity-group-${getKonvaSelectorSlugByExternalId(
            document.pdfExternalId
          )}`
        )
        ?.cache();
      const groupClientRect = clonedGroup.getClientRect();

      const discrepancyFootNotes = discrepancies
        .flatMap((discrepancy, index) =>
          discrepancy.annotations.map((annotation, subIndex) =>
            isDiscrepancyAnnotationInDocument(ornateRef, annotation, document)
              ? `[${index + 1}.${subIndex + 1}]: ${discrepancy.comment}`
              : undefined
          )
        )
        .filter((v) => !!v)
        .join('\n');

      if (discrepancyFootNotes) {
        clonedGroup.add(
          new Konva.Text({
            text: discrepancyFootNotes,
            x: 0,
            y: Math.round(groupClientRect.height),
            padding: 40,
            fontSize: 22,
            fill: '#ff0000',
            lineHeight: 1.1,
            fontFamily: 'Arial',
          })
        );
      }

      const clonedGroupRectAfterText = clonedGroup.getClientRect();
      const dataURL = clonedGroup.toDataURL();

      const layer = await pdf.embedPng(dataURL);
      const page = pdf.addPage([
        clonedGroupRectAfterText.width,
        clonedGroupRectAfterText.height,
      ]);

      page.drawImage(layer, {
        x: 0,
        y: 0,
        width: clonedGroupRectAfterText.width,
        height: clonedGroupRectAfterText.height,
      });
      if (isHidden) {
        ornateDocument.kImage.hide();
      }

      clonedGroup.destroy();
    }
  );

  await Promise.all(annotatedPIDs);

  const pdfBytes = await pdf.saveAsBase64({ dataUri: true });
  downloadURL(pdfBytes, fileName);
};

export default exportDocumentsToPdf;

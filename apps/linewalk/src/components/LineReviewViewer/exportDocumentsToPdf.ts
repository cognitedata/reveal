import { CogniteOrnate, downloadURL, OrnatePDFDocument } from '@cognite/ornate';
import { PDFDocument } from 'pdf-lib';
import Konva from 'konva';
import sortBy from 'lodash/sortBy';

import { ParsedDocument, DocumentType } from '../../modules/lineReviews/types';

import getAnnotationsByDocument from './getAnnotationsByDocument';
import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import { Discrepancy } from './LineReviewViewer';
import mapPidAnnotationIdsToIsoAnnotationIds from './mapPidAnnotationIdsToIsoAnnotationIds';

const isDiscrepancyInDocument = (
  document: ParsedDocument,
  documents: ParsedDocument[],
  discrepancy: Discrepancy
) => {
  const discrepancyAnnotationIds =
    document.type === DocumentType.ISO
      ? mapPidAnnotationIdsToIsoAnnotationIds(documents, discrepancy.ids)
      : discrepancy.ids;

  return getAnnotationsByDocument(document).some((annotation) =>
    discrepancyAnnotationIds.includes(annotation.id)
  );
};

const exportDocumentsToPdf = async (
  ornateRef: CogniteOrnate,
  documents: ParsedDocument[],
  discrepancies: Discrepancy[] = [],
  fileName = 'WorkSpace'
) => {
  const pdf = await PDFDocument.create();

  const sortedDocuments = [
    ...sortBy(
      documents.filter((document) => document.type === DocumentType.PID),
      (document) => document.externalId
    ),
    ...sortBy(
      documents.filter((document) => document.type === DocumentType.ISO),
      (document) => document.externalId
    ),
  ];

  const documentOrnateDocumentTuples = sortedDocuments.map<
    [ParsedDocument, OrnatePDFDocument]
  >((document) => {
    const ornateDocument = ornateRef.documents.find(
      (ornateDocument) =>
        ornateDocument.group.id() ===
        getKonvaSelectorSlugByExternalId(document.externalId)
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
            document.externalId
          )}`
        )
        ?.cache();
      const groupClientRect = clonedGroup.getClientRect();

      const discrepancyFootNotes = discrepancies
        .map((discrepancy, index) =>
          isDiscrepancyInDocument(document, sortedDocuments, discrepancy)
            ? `[${index + 1}]: ${discrepancy.comment}`
            : undefined
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
            fontSize: 20,
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
  downloadURL(pdfBytes, `${fileName}.pdf`);
};

export default exportDocumentsToPdf;

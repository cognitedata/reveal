/* eslint-disable no-await-in-loop */
import { useEffect, useMemo, useRef, useState } from 'react';
import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import { v4 as uuid } from 'uuid';
import * as PDFJS from 'pdfjs-dist';
import { DataElement, DocumentType, EquipmentDocument } from 'scarlet/types';

import {
  addDocumentTitle,
  addPageNumber,
  addTags,
  removeTags,
  Tag,
} from './utils';
import * as Styled from './style';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;

export type OrnateProps = {
  documents?: EquipmentDocument[];
  fullwidth?: boolean;
  dataElements?: DataElement[];
};

const VIEW_OFFSET_X = 150;
const VIEW_OFFSET_Y = 200;
const SLIDE_WIDTH = 2500;
const SLIDE_COLUMN_GAP = 300;
const SLIDE_ROW_GAP = 200;

type OrnateDocument = {
  ornateDocument: OrnatePDFDocument;
  id: number;
  externalId?: string;
  pageNumber: number;
};

export const Ornate = ({
  documents,
  dataElements,
  fullwidth = false,
}: OrnateProps) => {
  const componentContainerId = useRef(
    `react-ornate-instance-${uuid()}`
  ).current;
  const ornateViewer = useRef<CogniteOrnate>();
  const [ornateDocuments, setOrnateDocuments] = useState<OrnateDocument[]>([]);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const destroyDocumentLoadCallbacks = useRef<(() => void)[]>([]);

  // Setup Ornate
  useEffect(() => {
    if (ornateViewer.current) return;

    ornateViewer.current = new CogniteOrnate({
      container: `#${componentContainerId}`,
    });
  }, []);

  useEffect(() => {
    const ornateRef = ornateViewer.current;

    if (ornateRef && documents?.length && !ornateDocuments.length) {
      (async () => {
        await Promise.all(
          documents.map(async (document, iDocument) => {
            try {
              const pdfDocumentLoadingTask = await PDFJS.getDocument(
                document.downloadUrl!
              );

              destroyDocumentLoadCallbacks.current.push(
                pdfDocumentLoadingTask.destroy.bind(pdfDocumentLoadingTask)
              );

              const pdfDocument = await pdfDocumentLoadingTask.promise;
              const totalPages = pdfDocument?.numPages || 0;
              let yDocumentPosition = VIEW_OFFSET_Y;

              for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
                const page = await pdfDocument!.getPage(pageNumber);
                const pageWidth = page.view[2] - page.view[0];
                const pageHeight = page.view[3] - page.view[1];
                // after pdfToImage logic where min size of slide is 2500
                const slideWidth =
                  pageWidth > SLIDE_WIDTH ? pageWidth : SLIDE_WIDTH;
                const slideHeight = (pageHeight / pageWidth) * slideWidth;

                const ornateDocument = await ornateRef?.addPDFDocument(
                  pdfDocument,
                  pageNumber,
                  {},
                  {
                    zoomAfterLoad: false,
                    initialPosition: {
                      // --TODO: fix if needed
                      // it could be a problem if original page width is larger than slide width + slide column gap
                      // it's done like this to load documents async,
                      // so the next document position is not dependent on previous document width.
                      x:
                        VIEW_OFFSET_X +
                        iDocument * (SLIDE_WIDTH + SLIDE_COLUMN_GAP),
                      y: yDocumentPosition,
                    },
                    groupId: `${document.id}#${pageNumber}`,
                  }
                );

                addDocumentTitle({
                  document,
                  ornateDocument,
                });

                if (totalPages > 1) {
                  addPageNumber({
                    ornateDocument,
                    pageNumber,
                    totalPages,
                  });
                }

                yDocumentPosition += slideHeight + SLIDE_ROW_GAP;

                setOrnateDocuments((prevOrnateDocuments) => [
                  ...prevOrnateDocuments,
                  {
                    ornateDocument,
                    id: document.id,
                    externalId: document.externalId,
                    pageNumber,
                  },
                ]);
              }
            } catch (e) {
              console.error(`Failed to load document: ${document.id}`, e);
            }
            return true;
          })
        );
      })();
    }
  }, [documents]);

  useEffect(
    () => () => {
      destroyDocumentLoadCallbacks.current.forEach((destroy) => destroy());
    },
    []
  );

  const U1Document = useMemo(
    () => documents?.find((document) => document.type === DocumentType.U1),
    [documents]
  );

  const tags: Tag[] = useMemo(() => {
    const result: Tag[] = [];

    dataElements?.forEach((dataElement) => {
      dataElement.scannerDetections?.forEach((scannerDetection) => {
        if (!scannerDetection.valueAnnotation) return;

        const documentExternalId =
          scannerDetection.valueAnnotation.documentExternalId ||
          U1Document?.externalId;

        if (!documentExternalId) return;

        result.push({
          id: scannerDetection.id + dataElement.state,
          dataElement,
          ...scannerDetection.valueAnnotation,
          documentExternalId,
        });
      });
    });

    return result;
  }, [U1Document, dataElements]);

  useEffect(() => {
    if (ornateDocuments.length) {
      const newCurrentTags: string[] = [];
      ornateDocuments.forEach((document) => {
        const documentTags =
          tags?.filter(
            (tag) =>
              tag.documentExternalId === document.externalId &&
              tag.pageNumber === document.pageNumber
          ) || [];

        const newTags = documentTags?.filter(
          (tag) => !currentTags.includes(tag.id)
        );

        if (newTags?.length) {
          addTags({
            ornateViewer: ornateViewer.current!,
            ornateDocument: document.ornateDocument,
            tags: newTags,
          });
        }

        newCurrentTags.push(...documentTags.map((tag) => tag.id));
      });

      const removedTagIds = currentTags.filter(
        (id) => !newCurrentTags.includes(id)
      );

      if (removedTagIds.length) {
        removeTags({
          ornateViewer: ornateViewer.current!,
          tagIds: removedTagIds,
        });
      }

      setCurrentTags((prevTags) =>
        JSON.stringify(prevTags) === JSON.stringify(newCurrentTags)
          ? prevTags
          : newCurrentTags
      );
    }
  }, [ornateDocuments, tags]);

  return (
    <Styled.Container>
      {fullwidth ? (
        <Styled.FullWidthContainer>
          <div id={componentContainerId} />
        </Styled.FullWidthContainer>
      ) : (
        <div id={componentContainerId} />
      )}
    </Styled.Container>
  );
};

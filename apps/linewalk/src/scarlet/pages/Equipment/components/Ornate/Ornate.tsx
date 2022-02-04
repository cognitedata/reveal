/* eslint-disable no-await-in-loop */
import { useEffect, useRef, useState } from 'react';
import { CogniteOrnate, OrnatePDFDocument } from '@cognite/ornate';
import { v4 as uuid } from 'uuid';
import * as PDFJS from 'pdfjs-dist';
import {
  DataPanelActionType,
  EquipmentDocument,
  OrnateTag,
} from 'scarlet/types';
import { useDataPanelDispatch, useOrnateTags } from 'scarlet/hooks';

import { WorkspaceTools } from '..';

import {
  addDocumentTitle,
  addPageNumber,
  addTags,
  removeTags,
  zoomToTag,
} from './utils';
import * as Styled from './style';

PDFJS.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js`;

export type OrnateProps = {
  documents?: EquipmentDocument[];
  fullwidth?: boolean;
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

export const Ornate = ({ documents, fullwidth = false }: OrnateProps) => {
  const componentContainerId = useRef(
    `react-ornate-instance-${uuid()}`
  ).current;
  const container = useRef<HTMLDivElement>(null);
  const ornateViewer = useRef<CogniteOrnate>();
  const [ornateDocuments, setOrnateDocuments] = useState<OrnateDocument[]>([]);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const destroyDocumentLoadCallbacks = useRef<(() => void)[]>([]);
  const dataPanelDispatch = useDataPanelDispatch();
  const { tags, activeTag } = useOrnateTags();

  const openDataElementCard = (tag: OrnateTag) =>
    dataPanelDispatch({
      type: DataPanelActionType.OPEN_DATA_ELEMENT,
      dataElement: tag.dataElement,
      detection: tag.detection,
    });

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
                  {
                    documentExternalId: document.externalId!,
                    pageNumber: pageNumber.toString(),
                  },
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

  useEffect(() => {
    if (ornateDocuments.length) {
      const newCurrentTags: string[] = [];
      ornateDocuments.forEach((document) => {
        const documentTags =
          tags?.filter(
            (tag) =>
              tag.detection.documentExternalId === document.externalId &&
              tag.detection.pageNumber === document.pageNumber
          ) || [];

        const newTags = documentTags?.filter(
          (tag) => !currentTags.includes(tag.id)
        );

        if (newTags?.length) {
          addTags({
            ornateViewer: ornateViewer.current!,
            ornateDocument: document.ornateDocument,
            tags: newTags,
            onClick: openDataElementCard,
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

  useEffect(() => {
    if (!activeTag || !ornateViewer.current) return;

    const node = ornateViewer.current?.stage.findOne(`#${activeTag.id}`);
    if (node) {
      zoomToTag(ornateViewer.current, container.current!, node);
    }
  }, [ornateViewer, activeTag]);

  return (
    <Styled.Container ref={container}>
      {fullwidth ? (
        <Styled.FullWidthContainer>
          <div id={componentContainerId} />
        </Styled.FullWidthContainer>
      ) : (
        <div id={componentContainerId} />
      )}

      <WorkspaceTools ornateRef={ornateViewer.current} />
    </Styled.Container>
  );
};

import { OptionType } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { DIAGRAM_PARSER_SOURCE, DIAGRAM_PARSER_TYPE } from '@cognite/pid-tools';
import Konva from 'konva';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { FileInfo } from '@cognite/sdk';

import {
  addLineNumberToDocumentMetadata,
  getWorkspaceDocuments,
} from '../../modules/lineReviews/api';
import {
  DocumentType,
  WorkspaceDocument,
} from '../../modules/lineReviews/types';

import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import withoutFileExtension from './withoutFileExtension';

const DEFAULT_OPTION = {
  label: 'Go to document...',
  value: '',
};

const fileToOption = (
  externalId: string,
  type: string
): OptionType<string> => ({
  label: `${type.toUpperCase()}: ${withoutFileExtension(externalId)}`,
  value: externalId,
});

const useDocumentJumper = (
  lineNumber: string,
  documents: WorkspaceDocument[],
  ornateRef: CogniteOrnate | undefined,
  onAddWorkspaceDocument: (document: WorkspaceDocument) => void
) => {
  const { client } = useAuthContext();
  const [inputValue, setInputValue] = useState('');
  const [jumpToDocumentValue, setJumpToDocumentValue] =
    useState<OptionType<string>>(DEFAULT_OPTION);

  const [remoteFiles, setRemoteFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    (async () => {
      if (client !== undefined) {
        const files = await client.files
          .list({
            filter: {
              mimeType: 'application/pdf',
              metadata: {
                [DIAGRAM_PARSER_SOURCE]: 'true',
              },
            },
          })
          .autoPagingToArray({
            limit: Infinity,
          });
        setRemoteFiles(files);
      }
    })();
  }, [client]);

  const documentJumperOptions: OptionType<string>[] = [
    DEFAULT_OPTION,
    {
      label: 'Jump to document...',
      value: '',
      options: [
        ...documents
          .filter((document) => document.type === DocumentType.PID)
          .map((document) =>
            fileToOption(document.pdfExternalId, document.type)
          ),
        ...documents
          .filter((document) => document.type === DocumentType.ISO)
          .map((document) =>
            fileToOption(document.pdfExternalId, document.type)
          ),
      ],
    },
    ...(inputValue === ''
      ? []
      : [
          {
            label: 'Add document from CDF...',
            value: '',
            options: remoteFiles
              .filter(
                (file) =>
                  file.externalId &&
                  !documents
                    .flatMap((document) => document.pdfExternalId)
                    .includes(file.externalId)
              )
              .map<OptionType<string>>((file) => {
                if (file.externalId === undefined) {
                  throw new Error('File has no externalId');
                }

                if (file.metadata?.[DIAGRAM_PARSER_TYPE] === undefined) {
                  throw new Error('File has no DIAGRAM_PARSER_TYPE set');
                }

                return fileToOption(
                  file.externalId,
                  file.metadata[DIAGRAM_PARSER_TYPE]
                );
              }),
          },
        ]),
  ];

  useEffect(() => {
    (async () => {
      const value = jumpToDocumentValue?.value;
      if (ornateRef && value !== undefined && value !== '') {
        const isDocumentInWorkspace = documents.some(
          (document) => document.pdfExternalId === value
        );

        if (isDocumentInWorkspace) {
          const node = ornateRef.stage.findOne(
            `#${getKonvaSelectorSlugByExternalId(value)}`
          ) as Konva.Group;
          if (node) {
            ornateRef.zoomToGroup(node, {
              scaleFactor: 0.75,
            });
          }
        } else if (client !== undefined) {
          const file = remoteFiles.find((file) => file.externalId === value);

          if (file === undefined) {
            console.log(
              `Could not find file with externalId ${value} among remote files`
            );
            return;
          }

          const [workspaceDocument] = await getWorkspaceDocuments(client, [
            file,
          ]);

          await addLineNumberToDocumentMetadata(
            client,
            workspaceDocument.pdfExternalId,
            lineNumber
          );

          onAddWorkspaceDocument(workspaceDocument);
        }

        setJumpToDocumentValue(DEFAULT_OPTION);
      }
    })();
  }, [jumpToDocumentValue, ornateRef]);

  return {
    documentJumperOptions,
    jumpToDocumentValue,
    setJumpToDocumentValue,
    onInputChange: setInputValue,
    inputValue,
  };
};

export default useDocumentJumper;

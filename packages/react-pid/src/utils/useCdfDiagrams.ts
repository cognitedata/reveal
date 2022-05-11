import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { ExternalFileInfo, FileInfo } from '@cognite/sdk';
import {
  CognitePid,
  DIAGRAM_PARSER_OUTPUT_TYPE,
  DIAGRAM_PARSER_SOURCE,
  getFileNameWithoutExtension,
  LINEWALK_DATA_VERSION,
  DiagramType,
  getGraphExternalIdKey,
  DIAGRAM_PARSER_TYPE,
} from '@cognite/pid-tools';

import createEventForLineNumberIfDoesntExist from './createEventForLineNumberIfDoesntExist';
import lineNumbersMetadata from './lineNumbersMetadata';

export enum SaveState {
  Computing,
  Ready,
  Saving,
  Error,
  Saved,
}

const useCdfDiagrams = () => {
  const { client } = useAuthContext();
  const [diagrams, setDiagrams] = useState<FileInfo[]>([]);
  const pidViewer = useRef<CognitePid>();
  const [saveStatus, setSaveStatus] = useState<SaveState>(SaveState.Ready);

  useEffect(() => {
    client?.files
      .list({
        filter: { mimeType: 'image/svg+xml', source: DIAGRAM_PARSER_SOURCE },
      })
      .autoPagingToArray({ limit: Infinity })
      .then((fileInfoList) => {
        setDiagrams(fileInfoList);
      });
  }, []);

  const saveGraph = async () => {
    if (client === undefined) {
      return;
    }

    setSaveStatus(SaveState.Computing);
    if (!pidViewer.current) return;

    const graph = pidViewer.current.getGraphDocument();

    if (graph === null) return;

    setSaveStatus(SaveState.Saving);

    const fileNameWithoutExtension = getFileNameWithoutExtension(
      graph.documentMetadata.name
    );
    const externalId = `${fileNameWithoutExtension}.json`;
    const pdfExternalId = `${fileNameWithoutExtension}.pdf`;

    const fileInfo: ExternalFileInfo = {
      name: externalId,
      externalId,
      mimeType: 'application/json',
      source: DIAGRAM_PARSER_SOURCE,
      metadata: {
        [DIAGRAM_PARSER_SOURCE]: 'true',
        type: DIAGRAM_PARSER_OUTPUT_TYPE,
        diagramType: graph.documentMetadata.type,
        unit: graph.documentMetadata.unit,
        lineNumbers: graph.lineNumbers.join(','),
      },
    };
    try {
      await client?.files.upload(fileInfo, JSON.stringify(graph), true);
      setSaveStatus(SaveState.Saved);
      await client?.files.update([
        {
          externalId: pdfExternalId,
          update: {
            metadata: {
              add: {
                [DIAGRAM_PARSER_TYPE]: graph.documentMetadata.type,
                [getGraphExternalIdKey(LINEWALK_DATA_VERSION)]: externalId,
                ...lineNumbersMetadata(
                  LINEWALK_DATA_VERSION,
                  graph.lineNumbers,
                  graph.documentMetadata.unit
                ),
              },
              remove: [],
            },
          },
        },
      ]);

      if (graph.documentMetadata.type === DiagramType.ISO) {
        await Promise.all(
          graph.lineNumbers.map((lineNumber) =>
            createEventForLineNumberIfDoesntExist(client, {
              version: LINEWALK_DATA_VERSION,
              lineNumber,
              unit: graph.documentMetadata.unit,
            })
          )
        );
      }
    } catch (error) {
      setSaveStatus(SaveState.Error);
      throw Error();
    }
  };

  return { diagrams, pidViewer, saveGraph, saveState: saveStatus };
};

export default useCdfDiagrams;

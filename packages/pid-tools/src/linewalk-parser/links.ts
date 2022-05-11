import isMatch from 'lodash/isMatch';
import isEqual from 'lodash/isEqual';

import { SymbolConnection, SymbolConnectionId } from '../graphMatching/types';
import {
  PidFileConnectionInstance,
  GraphDocument,
  DiagramType,
  DiagramLabelOutputFormat,
  LineConnectionInstanceOutputFormat,
  DiagramTagOutputFormat,
} from '../types';
import {
  isFileConnection,
  isLineConnection,
  isIsoDocumentMetadata,
  getLineNumberAndPageFromText,
  isLineConnectionTag,
} from '../utils';
import { LINE_CONNECTION_LETTER_REGEX } from '../constants';

export const resolveFileAndLineConnections = (
  documents: GraphDocument[]
): SymbolConnection[] => {
  const symbolConnections: SymbolConnection[] = [];
  documents.forEach((document) => {
    document.symbolInstances?.forEach((symbol) => {
      let connection: SymbolConnection | undefined;
      if (isFileConnection(symbol)) {
        connection = findPidLink(symbol, document, documents);
      } else if (isLineConnection(symbol)) {
        connection = findIsoLink(symbol, document, documents);
      }
      if (connection === undefined) return;

      if (
        symbolConnections.some(
          (symbolConnection) =>
            (isEqual(symbolConnection.from, connection!.to) &&
              isEqual(symbolConnection.to, connection!.from)) ||
            (isEqual(symbolConnection.from, connection!.from) &&
              isEqual(symbolConnection.to, connection!.to))
        )
      )
        return;

      symbolConnections.push(connection);
    });
  });

  documents.forEach((document) => {
    document.tags?.forEach((tag) => {
      let connection: SymbolConnection | undefined;
      if (isLineConnectionTag(tag)) {
        connection = findIsoLinkTag(tag, document, documents);
      }
      if (connection === undefined) return;

      if (
        symbolConnections.some(
          (symbolConnection) =>
            (isEqual(symbolConnection.from, connection!.to) &&
              isEqual(symbolConnection.to, connection!.from)) ||
            (isEqual(symbolConnection.from, connection!.from) &&
              isEqual(symbolConnection.to, connection!.to))
        )
      )
        return;

      symbolConnections.push(connection);
    });
  });

  return symbolConnections;
};

export const findPidLink = (
  fileConnection: PidFileConnectionInstance,
  document: GraphDocument,
  documents: GraphDocument[]
): SymbolConnection | undefined => {
  // Currently only supports single direction connections
  if (
    fileConnection.fileDirection !== 'In' &&
    fileConnection.fileDirection !== 'Out'
  ) {
    return undefined;
  }

  const connectedDoc = documents.find((document) =>
    isMatch(document.documentMetadata, {
      type: DiagramType.PID,
      documentNumber: fileConnection.documentNumber,
      unit: fileConnection.unit || document.documentMetadata.unit, // either the explicit unit or the same as current
    })
  );

  if (connectedDoc === undefined) return undefined;

  const connectedInstance = connectedDoc?.symbolInstances.find(
    (symbol) =>
      isFileConnection(symbol) && symbol.position === fileConnection.toPosition
  );

  if (connectedInstance === undefined) return undefined;

  const ownAnnotation: SymbolConnectionId = {
    fileName: document.documentMetadata.name,
    instanceId: fileConnection.id,
  };

  const connectedAnnotation: SymbolConnectionId = {
    fileName: connectedDoc.documentMetadata.name,
    instanceId: connectedInstance.id,
  };

  if (fileConnection.fileDirection === 'In') {
    return {
      from: connectedAnnotation,
      to: ownAnnotation,
    };
  }

  return {
    from: ownAnnotation,
    to: connectedAnnotation,
  };
};

const getLineAndPageNumberFromLabels = (labels: DiagramLabelOutputFormat[]) => {
  for (let i = 0; i < labels.length; i++) {
    const lineNumberAndPage = getLineNumberAndPageFromText(labels[i].text);
    if (lineNumberAndPage) {
      return lineNumberAndPage;
    }
  }
  return null;
};

export const findIsoLink = (
  lineConnection: LineConnectionInstanceOutputFormat,
  document: GraphDocument,
  allDocuments: GraphDocument[]
): SymbolConnection | undefined => {
  if (lineConnection.pointsToFileName === 'SAME') {
    const linkedConnection = document.symbolInstances.find(
      (symbolInstance) =>
        isLineConnection(symbolInstance) &&
        symbolInstance.letterIndex === lineConnection.letterIndex &&
        symbolInstance.pointsToFileName === 'SAME' &&
        symbolInstance.id !== lineConnection.id
    );

    if (!linkedConnection) return undefined;

    return {
      from: {
        fileName: document.documentMetadata.name,
        instanceId: lineConnection.id,
      },
      to: {
        fileName: document.documentMetadata.name,
        instanceId: linkedConnection.id,
      },
    };
  }

  // Cross document connection
  const lineAndPageData = getLineAndPageNumberFromLabels(lineConnection.labels);
  if (!lineAndPageData) return undefined;
  const { lineNumber, pageNumber } = lineAndPageData;

  const linkedDocument = allDocuments.find(
    (doc) =>
      isIsoDocumentMetadata(doc.documentMetadata) &&
      doc.documentMetadata.lineNumber === lineNumber &&
      doc.documentMetadata.pageNumber === pageNumber
  );

  if (linkedDocument === undefined) return undefined;

  const pointToLineAndPageNumber = (
    labels: DiagramLabelOutputFormat[],
    lineNumber: string,
    pageNumber: number
  ) => {
    const lineAndPageNumberData = getLineAndPageNumberFromLabels(labels);
    if (!lineAndPageNumberData) return false;

    return (
      lineAndPageNumberData.lineNumber === lineNumber &&
      lineAndPageNumberData.pageNumber === pageNumber
    );
  };

  const { documentMetadata } = document;
  if (!isIsoDocumentMetadata(documentMetadata)) return undefined;

  const linkedConnection = linkedDocument.symbolInstances.find(
    (symbolInstance) =>
      isLineConnection(symbolInstance) &&
      symbolInstance.letterIndex === lineConnection.letterIndex &&
      pointToLineAndPageNumber(
        symbolInstance.labels,
        documentMetadata.lineNumber,
        documentMetadata.pageNumber
      )
  );

  if (linkedConnection === undefined) return undefined;

  return {
    from: {
      fileName: document.documentMetadata.name,
      instanceId: lineConnection.id,
    },
    to: {
      fileName: linkedDocument.documentMetadata.name,
      instanceId: linkedConnection.id,
    },
  };
};

const pointsToSame = (labels: DiagramLabelOutputFormat[]) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const label of labels) {
    if (label.text.includes('SAME')) return true;
  }
  return false;
};

const getLetterIndex = (labels: DiagramLabelOutputFormat[]) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const label of labels) {
    const lineConnectionLetterMatch = label.text.match(
      LINE_CONNECTION_LETTER_REGEX
    );
    if (lineConnectionLetterMatch) {
      return lineConnectionLetterMatch[0][1];
    }
  }
  return false;
};

export const findIsoLinkTag = (
  lineConnection: DiagramTagOutputFormat,
  document: GraphDocument,
  allDocuments: GraphDocument[]
): SymbolConnection | undefined => {
  if (pointsToSame(lineConnection.labels)) {
    const linkedConnection = document.tags.find(
      (tag) =>
        isLineConnectionTag(tag) &&
        pointsToSame(tag.labels) &&
        getLetterIndex(lineConnection.labels) === getLetterIndex(tag.labels) &&
        tag.id !== lineConnection.id
    );

    if (!linkedConnection) return undefined;

    return {
      from: {
        fileName: document.documentMetadata.name,
        instanceId: lineConnection.id,
      },
      to: {
        fileName: document.documentMetadata.name,
        instanceId: linkedConnection.id,
      },
    };
  }

  // Cross document connection
  const lineAndPageData = getLineAndPageNumberFromLabels(lineConnection.labels);
  if (!lineAndPageData) return undefined;
  const { lineNumber, pageNumber } = lineAndPageData;

  const linkedDocument = allDocuments.find(
    (doc) =>
      isIsoDocumentMetadata(doc.documentMetadata) &&
      doc.documentMetadata.lineNumber === lineNumber &&
      doc.documentMetadata.pageNumber === pageNumber
  );

  if (linkedDocument === undefined) return undefined;

  const pointToLineAndPageNumber = (
    labels: DiagramLabelOutputFormat[],
    lineNumber: string,
    pageNumber: number
  ) => {
    const lineAndPageNumberData = getLineAndPageNumberFromLabels(labels);
    if (!lineAndPageNumberData) return false;

    return (
      lineAndPageNumberData.lineNumber === lineNumber &&
      lineAndPageNumberData.pageNumber === pageNumber
    );
  };

  const { documentMetadata } = document;
  if (!isIsoDocumentMetadata(documentMetadata)) return undefined;

  const linkedConnection = linkedDocument.tags.find(
    (tag) =>
      isLineConnectionTag(tag) &&
      getLetterIndex(lineConnection.labels) === getLetterIndex(tag.labels) &&
      pointToLineAndPageNumber(
        tag.labels,
        documentMetadata.lineNumber,
        documentMetadata.pageNumber
      ) &&
      tag.id !== lineConnection.id
  );

  if (linkedConnection === undefined) return undefined;

  return {
    from: {
      fileName: document.documentMetadata.name,
      instanceId: lineConnection.id,
    },
    to: {
      fileName: linkedDocument.documentMetadata.name,
      instanceId: linkedConnection.id,
    },
  };
};

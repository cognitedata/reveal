import { CogniteClient } from '@cognite/sdk';
import { Scan } from 'types';
import { IRectangle, Rectangle } from 'utils';

export const callDiagramDetection = async (
  client: CogniteClient,
  { documentId }: { documentId: number }
): Promise<Scan> => {
  const resp = await client.post(
    `/api/playground/projects/${client.project}/context/diagram/detect`,
    {
      data: {
        items: [
          {
            fileId: documentId,
          },
        ],
        entities: [{}],
        searchField: 'name',
        partialMatch: false,
        minTokens: 2,
      },
    }
  );
  return resp.data;
};

export const getDocumentOCR = async (
  client: CogniteClient,
  { documentId }: { documentId: number }
): Promise<any> => {
  const resp = await client.post(
    `/api/playground/projects/${client.project}/context/pnid/ocr`,
    {
      data: {
        fileId: documentId,
      },
    }
  );
  return resp.data.items[0].annotations;
};

interface IElement {
  text: string;
  type: string;
  confidence: number;
  boundingBox: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
}

export const getDocumentOCRSelected = async (
  client: CogniteClient | undefined,
  documentId: number,
  boundingBox: IRectangle | undefined,
  multiplier = 1
): Promise<string> => {
  if (!client) return '';

  const ocrData = await getDocumentOCR(client, { documentId });
  let result = '';
  ocrData.forEach((element: IElement) => {
    const elementBoundingBox = {
      x: element.boundingBox.xMin * multiplier,
      y: element.boundingBox.yMin * multiplier,
      width: (element.boundingBox.xMax - element.boundingBox.xMin) * multiplier,
      height:
        (element.boundingBox.yMax - element.boundingBox.yMin) * multiplier,
    };
    const intersectPercentage = Rectangle.IntersectPercentage(
      elementBoundingBox,
      {
        x: boundingBox.x * multiplier,
        y: boundingBox.y * multiplier,
        width: boundingBox.width * multiplier,
        height: boundingBox.height * multiplier,
      }
    );
    if (intersectPercentage > 0.5) {
      result += ` ${element.text}`;
    }
  });
  return result.trim();
};

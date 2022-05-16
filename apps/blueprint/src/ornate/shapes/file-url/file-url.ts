import Konva from 'konva';
import { v4 as uuid } from 'uuid';

import { OrnateShapeConfig, Shape } from '..';

import { OrnateFileAnnotation } from './types';
import { pdfToImage } from './pdf-to-image';

export type OrnateFileURLConfig = OrnateShapeConfig & {
  fileReference?: Record<string, string>;
  fileName?: string;
  pageNumber?: number;
  shouldCenterOnDoubleClick?: boolean;
  zoomAfterLoad?: boolean;
  loadAnnotations?: boolean;
  getURLFunc: (config: OrnateFileURLConfig) => Promise<string>;
  onLoadListeners?: ((shape: FileURL) => void)[];
  getAnnotationsFunc?: (
    config: OrnateFileURLConfig
  ) => Promise<OrnateFileAnnotation[]>;
  onAnnotationsLoad?: (annotations: OrnateFileAnnotation[]) => void;
  onAnnotationClick?: (annotation: OrnateFileAnnotation) => void;
  mimeType?: string;
};

const toDataUrl = (url: string): Promise<string> => {
  return new Promise((res) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        res(reader.result as string);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
};

export class FileURL extends Shape<OrnateFileURLConfig> {
  constructor(config: OrnateFileURLConfig) {
    super(config);
    const id = config.id || uuid();
    const group = new Konva.Group({
      ...config,
      type: 'FILE_URL',
      name: 'FILE_URL',
      draggable: false,
      id,
    });

    this.loadFileIntoGroup(group);

    this.shape = group;
  }

  getBase64 = async (fileDownloadLink: string) => {
    const { pageNumber = 1, mimeType = 'pdf' } = this.config;
    if (mimeType.includes('pdf')) {
      const { data: base64, pdf } = await pdfToImage(
        fileDownloadLink,
        pageNumber
      );
      return { base64, pdf };
    }
    if (mimeType.includes('image')) {
      const base64 = await toDataUrl(fileDownloadLink);
      return { base64, pdf: null };
    }
    return { base64: null, pdf: null };
  };

  loadFileIntoGroup = async (group: Konva.Group) => {
    const { pageNumber = 1, getURLFunc, onLoadListeners } = this.config;
    try {
      const fileDownloadLink = await getURLFunc(this.config);

      const { base64, pdf } = await this.getBase64(fileDownloadLink);
      if (!base64) {
        throw new Error('File is invalid');
      }
      const image = new Image();
      image.onload = async () => {
        // Draw PDF image
        const kBaseImage = new Konva.Image({
          image,
          width: image.width,
          height: image.height,
          stroke: 'black',
          strokeWidth: 1,
          groupId: group.id(),
          forceSelectGroup: true,
          preventSerialize: true,
        });
        kBaseImage.image(image);

        group.add(kBaseImage);
        kBaseImage.zIndex(1);

        const baseRect = new Konva.Rect({
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
          fill: '#E8E8E8',
          groupId: group.id(),
          forceSelectGroup: true,
          preventSerialize: true,
        });
        group.add(baseRect);
        group.setAttr('PDFCurrentPage', pageNumber);
        group.setAttr('PDFMaxPages', pdf?.numPages);
        group.width(image.width);
        group.height(image.height);
        baseRect.zIndex(0);

        if (onLoadListeners && onLoadListeners.length > 0) {
          onLoadListeners.forEach((onLoad) => {
            if (onLoad && typeof onLoad === 'function') {
              onLoad(this);
            }
          });
        }

        if (this.config.getAnnotationsFunc) {
          this.loadAnnotationsIntoGroup(group);
        }
      };
      image.onerror = () => {
        group.add(new Konva.Text({ text: 'Failed to load file' }));
      };
      image.src = base64;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      group.add(new Konva.Text({ text: 'Failed to load file' }));
    }
  };

  loadAnnotationsIntoGroup = async (group: Konva.Group) => {
    const { onAnnotationClick, getAnnotationsFunc, onAnnotationsLoad } =
      this.config;
    if (!getAnnotationsFunc) return;
    try {
      const annotations = await getAnnotationsFunc(this.config);

      const annotationShapes = annotations.map((a) => {
        const newShape = new Konva.Rect({
          x: a.x * this.shape.width(),
          y: a.y * this.shape.height(),
          width: a.width * this.shape.width(),
          height: a.height * this.shape.height(),
          stroke: 'blue',
          strokeWidth: 1,
          unselectable: true,
          preventSerialize: true,
          groupId: this.config.id,
          id: a.id,
          type: 'FILE_ANNOTATION',
        });
        if (onAnnotationClick) {
          newShape.on('click', () => {
            if (onAnnotationClick) onAnnotationClick(a);
          });
        }
        return newShape;
      });

      if (annotationShapes.length > 0) {
        group.add(...annotationShapes);
      }
      if (onAnnotationsLoad) {
        onAnnotationsLoad(annotations);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };
}

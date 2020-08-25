import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ReactPictureAnnotation,
  IAnnotation,
  IRectShapeData,
} from '@cognite/react-picture-annotation';
import { Button, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Pagination } from 'antd';
import { Loader } from 'components/Common';
import { FileInfo, CogniteClient } from 'cognite-sdk-v3';

const DocumentPagination = styled(Pagination)`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  bottom: 16px;
  && {
    background: #fff;
    border-radius: 50px;
    padding: 12px 24px;
    box-shadow: 0px 0px 8px ${Colors['greyscale-grey3'].hex()};
  }
`;

const Buttons = styled.div`
  display: inline-flex;
  position: absolute;
  z-index: 2;
  right: 24px;
  bottom: 24px;
  && #controls {
    display: inline-flex;
  }
  && #controls > * {
    border-radius: 0px;
  }
  && #controls > *:nth-child(1) {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  && #controls > *:nth-last-child(1) {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export type IAnnotationWithPage = IAnnotation<IRectShapeData> & {
  page?: number;
};

type Props = {
  file?: FileInfo;
  sdk: CogniteClient;
  drawLabel?: boolean;
  creatable?: boolean;
  hoverable?: boolean;
  annotations?: IAnnotationWithPage[];
  onSelect?: (annotation?: IAnnotationWithPage) => void;
  editCallbacks?: {
    onUpdate: (annotation: IAnnotationWithPage) => void;
    onCreate: (annotation: IAnnotationWithPage) => void;
    onDelete: (annotation: IAnnotationWithPage) => void;
  };
  renderItemPreview?: (
    editable: boolean,
    annotation: IAnnotation,
    onChange: (value: string) => void,
    onDelete: () => void,
    height: React.CSSProperties['maxHeight']
  ) => React.ReactElement;
  page?: number;
  setPage?: (page: number) => void;
  hidePagination?: boolean;
  reloadSize?: boolean;
};

export const FileViewer = React.forwardRef<ReactPictureAnnotation, Props>(
  (props, ref) => {
    const {
      file,
      sdk,
      annotations,
      drawLabel = true,
      hoverable = true,
      onSelect,
      editCallbacks,
      renderItemPreview,
      creatable,
      hidePagination,
      page,
      setPage,
    } = props || {};
    const [realAnnotations, setRealAnnotations] = useState<
      IAnnotationWithPage[]
    >(annotations || ([] as IAnnotationWithPage[]));

    const wrapperRef = useRef<HTMLDivElement>(null);

    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

    const fileId = file ? file.id : undefined;

    useEffect(() => {
      (async () => {
        if (fileId) {
          setPreviewUrl(undefined);
          setLoading(true);
          setPreviewUrl(await retrieveDownloadUrl(sdk, fileId));
          setLoading(false);
        }
      })();
    }, [sdk, fileId]);

    useEffect(() => {
      if (annotations) {
        setRealAnnotations(annotations);
      }
    }, [annotations]);

    useEffect(() => {
      if (wrapperRef.current) {
        // change width from the state object
        setHeight(wrapperRef.current!.clientHeight);
        setWidth(wrapperRef.current!.clientWidth);
      }
    }, [wrapperRef]);

    useEffect(() => {
      const resizeListener = () => {
        if (wrapperRef.current) {
          // change width from the state object
          setHeight(wrapperRef.current!.clientHeight);
          setWidth(wrapperRef.current!.clientWidth);
        }
      };
      // set resize listener
      window.addEventListener('resize', resizeListener);

      // clean up function
      return () => {
        // remove resize listener
        window.removeEventListener('resize', resizeListener);
      };
    }, []);

    const onAnnotationSelect = (id: string | null) => {
      if (!onSelect) {
        return;
      }
      if (id === null) {
        onSelect(undefined);
      }
      const annotation = realAnnotations.find(el => el.id === id);
      if (annotation) {
        onSelect(annotation);
      }
    };

    const defaultRef = useRef<ReactPictureAnnotation | null>(null);
    const annotatorRef = ref as React.RefObject<ReactPictureAnnotation>;

    const isImage: boolean = useMemo(() => {
      if (file) {
        return isPreviewableImage(file);
      }
      return false;
    }, [file]);

    return (
      <div
        ref={wrapperRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {loading && (
          <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
            <Loader />
          </div>
        )}
        <ReactPictureAnnotation
          ref={ref || defaultRef}
          drawLabel={drawLabel}
          hoverable={hoverable}
          annotationData={realAnnotations.filter(
            el => totalPages === 1 || el.page === page
          )}
          onChange={e => {
            setRealAnnotations(
              realAnnotations
                .filter(el => !(totalPages === 1 || el.page === page))
                .concat(e)
            );
          }}
          onSelect={onAnnotationSelect}
          onAnnotationCreate={editCallbacks && editCallbacks.onCreate}
          onAnnotationDelete={editCallbacks && editCallbacks.onDelete}
          onAnnotationUpdate={editCallbacks && editCallbacks.onUpdate}
          pdf={
            file && file.mimeType === 'application/pdf' ? previewUrl : undefined
          }
          image={file && isImage ? previewUrl : undefined}
          creatable={creatable}
          width={width}
          height={height}
          page={page}
          onLoading={isLoading => setLoading(isLoading)}
          renderItemPreview={renderItemPreview}
          onPDFLoaded={({ pages }) => {
            setLoading(false);
            setTotalPages(pages);
          }}
        />
        {totalPages > 1 && !hidePagination && (
          <DocumentPagination
            total={totalPages}
            current={page || 1}
            pageSize={1}
            size="small"
            showQuickJumper
            onChange={newPageNum => setPage && setPage(newPageNum)}
          />
        )}
        {(!!defaultRef || !!annotatorRef) && (
          <Buttons>
            <div id="controls">
              <Button
                onClick={() => {
                  if (defaultRef && defaultRef.current) {
                    defaultRef.current.zoomIn();
                  } else if (annotatorRef && annotatorRef.current) {
                    annotatorRef.current.zoomIn();
                  }
                }}
                icon="ZoomIn"
              />
              <Button
                icon="Refresh"
                onClick={() => {
                  if (defaultRef && defaultRef.current) {
                    defaultRef.current.reset();
                  } else if (annotatorRef && annotatorRef.current) {
                    annotatorRef.current.reset();
                  }
                }}
              />
              <Button
                icon="ZoomOut"
                onClick={() => {
                  if (defaultRef && defaultRef.current) {
                    defaultRef.current.zoomOut();
                  } else if (annotatorRef && annotatorRef.current) {
                    annotatorRef.current.zoomOut();
                  }
                }}
              />
            </div>
          </Buttons>
        )}
      </div>
    );
  }
);

export const retrieveDownloadUrl = async (
  client: CogniteClient,
  fileId: number
) => {
  try {
    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: fileId },
    ]);
    return downloadUrl;
  } catch {
    return undefined;
  }
};

export const isPreviewableImage = (file: FileInfo) => {
  const { mimeType = '' } = file;
  return ['png', 'jpeg', 'jpg', 'svg'].some(el => mimeType.includes(el));
};

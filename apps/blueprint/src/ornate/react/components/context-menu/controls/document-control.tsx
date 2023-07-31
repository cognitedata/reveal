import { Button, Dropdown, Label, Menu } from '@cognite/cogs.js';
import Konva from 'konva';
import { useCallback, useEffect, useState } from 'react';

import { FileURL } from '../../../../shapes';

import * as S from './elements';
import { ControlProps } from './types';

export const DocumentControl: React.FC<ControlProps> = ({
  nodes,
  instance,
}) => {
  const [documentName, setDocumentName] = useState();
  const [currentPage, setCurrentPage] = useState<number>();
  const [maxPages, setMaxPages] = useState<number>();

  const setData = useCallback(() => {
    const { fileName, PDFCurrentPage, PDFMaxPages } =
      (nodes[0] as Konva.Group).children?.find(
        (node) => node.attrs.type === 'FILE_URL'
      )?.attrs || {};

    setDocumentName(fileName);
    setCurrentPage(PDFCurrentPage);
    setMaxPages(PDFMaxPages);
  }, [nodes]);

  useEffect(() => {
    setData();
  }, [setData]);

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    const documentNode = (nodes[0] as Konva.Group).children?.find(
      (node) => node.attrs.type === 'FILE_URL'
    );
    if (!documentNode) return;
    const nextShape = new FileURL({
      ...documentNode.attrs,
      pageNumber: nextPage,
    });
    documentNode.destroy();
    instance.addShape([nextShape]);
  };

  const renderPageDropdown = () => {
    if (!maxPages) return null;
    const items = [];
    for (let i = 1; i < maxPages + 1; i++) {
      items.push(
        <Menu.Item onClick={() => handlePageChange(i)}>Page {i}</Menu.Item>
      );
    }
    return items;
  };

  return (
    <>
      {documentName && (
        <Label
          icon="Document"
          size="small"
          onClick={() => {
            window.navigator.clipboard.writeText(documentName || '');
          }}
        >
          <S.DocumentNameSpan>{documentName}</S.DocumentNameSpan>
        </Label>
      )}
      {maxPages && maxPages > 0 && (
        <Dropdown content={<Menu>{renderPageDropdown()}</Menu>}>
          <Button type="ghost">
            Page {currentPage} / {maxPages}
          </Button>
        </Dropdown>
      )}
    </>
  );
};

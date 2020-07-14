import Collapse, { CollapseProps } from 'antd/lib/collapse';
import React from 'react';
import styled from 'styled-components';

import { Document, JsonDocTypes, TextContainerProps } from './types';
import {
  getCategoryByPriority,
  getDocumentsByCategory,
  getDocumentTitle,
  getShortDescription,
} from './utils';

const { Panel } = Collapse;

export type DocumentRenderer = (
  document: Document,
  i: number,
  documents: Document[],
  category: string,
  description: string
) => React.ReactNode;

interface Category {
  type: string;
  description: string;
  documents: Document[];
}

interface DocumentTableProps {
  className?: string;
  docs: Document[];
  handleDocumentClick: (
    document: Document,
    category: string,
    description: string
  ) => void;
  collapseProps?: CollapseProps;
  categoryPriorityList?: string[];
  unknownCategoryName?: string;
  documentTitleField?: string[];
  documentTypeField?: string[];
  docTypes?: JsonDocTypes;
  noDocumentsSign?: string | React.ReactNode;
  documentRenderer?: DocumentRenderer;
  categorySort?: (leftSide: Category, rightSide: Category) => number;
  renderPanelHeader?: (
    description: string,
    docNumber: number
  ) => string | React.ReactNode;
  defaultExpandAll?: boolean;
  scrollX?: boolean;
}

interface DocumentTableState {
  stateParam?: string;
}

export class DocumentTable extends React.PureComponent<
  DocumentTableProps,
  DocumentTableState
> {
  public static defaultProps = {
    handleDocumentClick: () => null,
    scrollX: false,
  };

  public renderDocument = (category: string, description: string) => (
    document: Document,
    i: number,
    all: Document[]
  ) => {
    const { documentRenderer } = this.props;
    if (documentRenderer) {
      return documentRenderer(document, i, all, category, description);
    }

    const { documentTitleField, handleDocumentClick, scrollX } = this.props;

    return (
      <LinkContainer key={document.id}>
        <LinkStyle
          key={document.id}
          data-test-id="file-name"
          onClick={() => handleDocumentClick(document, category, description)}
          tabIndex={-1}
        >
          {document.fileName}
        </LinkStyle>
        <TextContainerTop data-test-id="document-title" scrollX={scrollX}>
          {getDocumentTitle(document.metadata, documentTitleField)}
        </TextContainerTop>
      </LinkContainer>
    );
  };

  public renderPanelHeader = (description: string, docNumber: number) => {
    const { renderPanelHeader } = this.props;
    if (renderPanelHeader) {
      return renderPanelHeader(description, docNumber);
    } else {
      return (
        <PanelHeader>
          {description} <span className="count">{docNumber}</span>
        </PanelHeader>
      );
    }
  };

  public render() {
    const {
      className,
      docs,
      categoryPriorityList,
      unknownCategoryName,
      documentTypeField,
      docTypes,
      noDocumentsSign,
      collapseProps,
      categorySort,
      defaultExpandAll,
    } = this.props;
    const documentsByCategory = getDocumentsByCategory(
      docs || [],
      unknownCategoryName,
      docTypes,
      documentTypeField
    );
    const categoryByPriority = getCategoryByPriority(
      documentsByCategory,
      categoryPriorityList
    );

    if (!categoryByPriority.length) {
      return (
        <NoDocuments data-test-id="no-documents">
          {noDocumentsSign
            ? noDocumentsSign
            : 'No documents linked to this asset'}
        </NoDocuments>
      );
    }

    const categoryWithData = categoryByPriority.map((category) => ({
      type: category,
      ...documentsByCategory[category],
    }));
    if (categorySort) {
      categoryWithData.sort(categorySort);
    }

    const defaultActiveKeys = defaultExpandAll
      ? // To expand all by default, we have to pass in an array
        // containing the key of every single panel
        categoryWithData.map((category) => category.type)
      : (collapseProps || {}).defaultActiveKey;

    return (
      <React.Fragment>
        <TableWrapper className={className}>
          <CollapseContainer
            {...collapseProps}
            defaultActiveKey={defaultActiveKeys}
          >
            {categoryWithData.map((category) => {
              const { description, documents, type } = category;
              return (
                <PanelWrapper
                  header={this.renderPanelHeader(
                    getShortDescription(description),
                    documents.length
                  )}
                  key={type}
                >
                  {documents.map(this.renderDocument(type, description))}
                </PanelWrapper>
              );
            })}
          </CollapseContainer>
        </TableWrapper>
      </React.Fragment>
    );
  }
}

const TableWrapper = styled.div`
  width: 100%;
  justify-content: center;
  display: flex;
`;

const LinkContainer = styled.div`
  display: flex;
  margin: 10px 0;
  white-space: nowrap;
`;

const CollapseContainer = styled(Collapse)`
  width: 100%;
`;

const TextContainerTop = styled.div<TextContainerProps>`
  width: 100%;
  overflow: ${(props) => (props.scrollX ? '' : 'hidden')};
  text-overflow: ${(props) => (props.scrollX ? '' : 'ellipsis')};
`;

const PanelWrapper = styled(Panel)`
  text-align: left;

  .ant-collapse-content-box {
    overflow: auto;
  }
`;

const PanelHeader = styled.div`
  .count {
    background: #e8e8e8;
    display: inline-block;
    text-align: center;
    padding: 0 10px;
    border-radius: 9999px;
    margin-left: 12px;
  }
`;

const LinkStyle = styled.a`
  font-size: 1.125em;
  margin-right: 10px;
`;

const NoDocuments = styled.div`
  padding: 16px;
`;

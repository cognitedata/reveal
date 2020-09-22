import React, { useContext, useState, useCallback } from 'react';
import { ResourceItem } from 'types';
import { Splitter } from 'components/Common';
import { ResourcePreviewSidebar } from 'containers/ResourceSidebar';
import styled from 'styled-components';
import { SIDEBAR_RESIZE_EVENT } from 'utils/WindowEvents';

export type ResourcePreviewProps = {
  item?: ResourceItem;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  placeholder?: React.ReactNode;
  onClose?: () => void;
};

export type ResourcePreviewObserver = {
  openPreview: (props: ResourcePreviewProps) => void;
  hidePreview: () => void;
};

const ResourcePreviewContext = React.createContext(
  {} as ResourcePreviewObserver
);

export const useResourcePreview = () => {
  const observer = useContext(ResourcePreviewContext);
  return observer;
};

export const ResourcePreviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [header, setHeader] = useState<React.ReactNode>(null);
  const [footer, setFooter] = useState<React.ReactNode>(null);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [placeholder, setPlaceholder] = useState<React.ReactNode>(null);
  const [onClose, setOnCloseCallback] = useState<() => void>(() => () => {});
  const [item, setItem] = useState<ResourceItem | undefined>(undefined);

  const openPreview = useCallback((previewDetails: ResourcePreviewProps) => {
    const {
      item: newItem,
      content: newContent,
      header: newHeader,
      footer: newFooter,
      placeholder: newPlaceholder,
      onClose: newOnClose = () => {},
    } = previewDetails;
    setItem(newItem);
    setContent(newContent);
    setHeader(newHeader);
    setFooter(newFooter);
    setPlaceholder(newPlaceholder);
    setOnCloseCallback(() => newOnClose);
    setIsOpen(true);
  }, []);

  const hidePreview = useCallback(() => {
    setIsOpen(false);
    setItem(undefined);
    setContent(null);
    setHeader(null);
    setFooter(null);
    setPlaceholder(null);
    setOnCloseCallback(() => () => {});
  }, []);

  return (
    <ResourcePreviewContext.Provider
      value={{
        openPreview,
        hidePreview,
      }}
    >
      <Splitter flex={[0]} hide={isOpen ? [] : [1]}>
        <ChildrenWrapper>{children}</ChildrenWrapper>
        <ResourcePreviewSidebar
          item={item}
          header={header}
          footer={footer}
          content={content}
          placeholder={placeholder}
          onClose={() => {
            setIsOpen(false);
            onClose();
            setTimeout(
              () => window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT)),
              200
            );
          }}
        />
      </Splitter>
    </ResourcePreviewContext.Provider>
  );
};

const ChildrenWrapper = styled.div`
  overflow-y: auto;
`;

export default ResourcePreviewContext;

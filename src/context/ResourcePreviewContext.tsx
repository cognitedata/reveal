import React, { useContext, useState, useCallback } from 'react';
import { ResourceItem } from 'types';
import { Splitter } from 'components/Common';
import { ResourcePreviewSidebar } from 'containers/ResourceSidebar';
import styled from 'styled-components';
import { SIDEBAR_RESIZE_EVENT } from 'utils/WindowEvents';

export type ResourcePreviewProps = {
  /**
   * The resource to preview, this is the easiest way to preview something with the default resource preview
   */
  item?: ResourceItem;
  /**
   * Additional header
   */
  header?: React.ReactNode;
  /**
   * Additional footer
   */
  footer?: React.ReactNode;
  /**
   * Replace the content (would cover over the item preview)
   */
  content?: React.ReactNode;
  /**
   * Placeholder for when no item is provided
   */
  placeholder?: React.ReactNode;
  /**
   * Callback for when the preview is closed
   */
  onClose?: () => void;
};

export type ResourcePreviewObserver = {
  /**
   * Opens the preview for a resource
   */
  openPreview: (props?: ResourcePreviewProps) => void;
  /**
   * Closes the current preview
   */
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

  const openPreview = useCallback(
    (previewDetails: ResourcePreviewProps = {}) => {
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
    },
    []
  );

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
      <Splitter>
        <ChildrenWrapper>{children}</ChildrenWrapper>
        {isOpen && (
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
        )}
      </Splitter>
    </ResourcePreviewContext.Provider>
  );
};

const ChildrenWrapper = styled.div`
  overflow-y: auto;
`;

export default ResourcePreviewContext;

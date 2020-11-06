import React, { useContext, useState, useCallback } from 'react';
import { ResourceItem } from 'lib/types';
import { Splitter } from 'lib/components';
import { ResourcePreviewSidebar } from 'lib/containers/ResourceSidebar';
import styled from 'styled-components';
import { SIDEBAR_RESIZE_EVENT } from 'lib/utils/WindowEvents';
import { useSelectedResource } from 'lib/context/ResourceSelectionContext';

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
   * Is the preview closable, default to `true`
   */
  closable?: boolean;
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
  const [closable, setClosable] = useState<boolean>(true);
  const [placeholder, setPlaceholder] = useState<React.ReactNode>(null);
  const [onClose, setOnCloseCallback] = useState<() => void>(() => () => {});
  const [item, setItem] = useState<ResourceItem | undefined>(undefined);

  const { setSelectedResource } = useSelectedResource();

  const openPreview = useCallback(
    (previewDetails: ResourcePreviewProps = {}) => {
      const {
        item: newItem,
        content: newContent,
        header: newHeader,
        footer: newFooter,
        placeholder: newPlaceholder,
        onClose: newOnClose = () => {},
        closable: newClosable = true,
      } = previewDetails;
      setItem(newItem);
      setContent(newContent);
      setHeader(newHeader);
      setFooter(newFooter);
      setPlaceholder(newPlaceholder);
      setClosable(newClosable);
      setOnCloseCallback(() => newOnClose);
      setIsOpen(true);
      setSelectedResource(newItem);
    },
    [setSelectedResource]
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
            closable={closable}
            onClose={() => {
              setIsOpen(false);
              setSelectedResource(undefined);
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
  display: flex;
  flex-direction: column;
`;

export default ResourcePreviewContext;

/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useState, useCallback } from 'react';
import { ModalProps, Modal } from '@cognite/cogs.js';

export type DEWrapperProps = {
  content?: React.ReactNode;
} & Omit<Omit<ModalProps, 'children'>, 'visible'>;

export type DEWrapperContextObserver = {
  openModal: (props: DEWrapperProps) => void;
  hideModal: () => void;
};

const DEWrapperContext = React.createContext({} as DEWrapperContextObserver);

export const useModal = () => {
  const { openModal, hideModal } = useContext(DEWrapperContext);
  return { openModal, hideModal };
};

const DEWrapperProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalProps, setModalProps] = useState<DEWrapperProps>({});

  const openModal = useCallback((previewDetails: DEWrapperProps) => {
    const { content: newContent, ...otherProps } = previewDetails;
    setModalProps(otherProps);
    setModalContent(newContent);
    setIsModalOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalProps({});
  }, []);

  return (
    <DEWrapperContext.Provider
      value={{
        openModal,
        hideModal,
      }}
    >
      <Modal
        // ariaHideApp={false}
        visible={isModalOpen}
        {...modalProps}
        onCancel={(...props) => {
          if (modalProps.onCancel) {
            if (modalProps.onCancel(...props)) {
              setIsModalOpen(false);
            }
          } else {
            setIsModalOpen(false);
          }
        }}
        onOk={(...props) => {
          if (modalProps.onOk) {
            if (modalProps.onOk(...props)) {
              setIsModalOpen(false);
            }
          } else {
            setIsModalOpen(false);
          }
        }}
      >
        {modalContent}
      </Modal>
      {children}
    </DEWrapperContext.Provider>
  );
};

export { DEWrapperProvider as DEWrapper };
export default DEWrapperContext;

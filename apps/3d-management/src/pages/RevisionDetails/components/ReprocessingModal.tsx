import { getContainer, projectName } from 'src/utils';
import Modal from 'antd/lib/modal';
import React from 'react';
import { ModalProps } from 'antd/lib/modal/Modal';
import message from 'antd/lib/message';
import MessageType from 'src/AntdMessage';
import * as Sentry from '@sentry/browser';
import { requestReprocessing } from 'src/utils/sdk/3dApiUtils';
import { v3, v3Client } from '@cognite/cdf-sdk-singleton';
import { useHistory } from 'react-router-dom';

type Props = Omit<ModalProps, 'onOk' | 'onCancel'> & {
  modelId: number;
  revision: v3.Revision3D;
  onSuccess: Function;
  onClose: () => void;
};

// revisions created after that date should be easily reprocessable
// without recreation. Revisions before that date must be recreated.
const MAGIC_DATE = new Date(2020, 0, 1);
const ERR_DURATION = 5; // in seconds

export const ReprocessingModal = ({
  modelId,
  revision,
  onSuccess,
  onClose,
  ...restProps
}: Props) => {
  const history = useHistory();
  const isReprocessable = revision.createdTime > MAGIC_DATE;

  const onOk = async () => {
    const progressMessage = message.loading(
      'Requesting reprocessing...'
    ) as MessageType;

    onClose();

    try {
      if (!isReprocessable) {
        const createdRevision = (
          await v3Client.revisions3D.create(modelId, [
            {
              camera: revision.camera,
              fileId: revision.fileId,
              metadata: revision.metadata,
              published: false, // api throws 400 if incomplete revision is published

              // @ts-ignore fixme D3M-19 - wrong types in sdk
              rotation: revision.rotation,
            },
          ])
        )[0];

        progressMessage.then(() => {
          message.success('New revision is created!');
          history.push(
            `/${projectName}/3d-models/${modelId}/revisions/${createdRevision.id}`
          );
        });

        return;
      }

      await requestReprocessing({
        project: projectName,
        modelId,
        revisionId: revision.id,
      });

      onSuccess();

      progressMessage.then(() =>
        message.success('Reprocessing request is sent.')
      );
    } catch (e) {
      const isDeprecatedFileFormat = (err: Error) => {
        return err.message.includes('Unsupported file extension');
      };
      const error = e as v3.HttpError | v3.CogniteMultiError<any, any> | Error;

      if (
        isDeprecatedFileFormat(error) ||
        ('errors' in error && error.errors.some(isDeprecatedFileFormat))
      ) {
        // expected case, so don't capture with Sentry
        progressMessage.then(() => {
          message.error(
            `The file format is not supported, please create a new revision manually.`,
            ERR_DURATION
          );
        });

        return;
      }

      progressMessage.then(() => {
        message.error("Can't send request for reprocessing.", ERR_DURATION);
        Sentry.captureException(error);
      });
    }
  };

  const TooOldToReprocessMessage = () => (
    <>
      <p>
        This model doesn&apos;t have the data necessary to reprocess the
        revision.
      </p>

      <p>
        If you continue, <b>a new model revision will be generated</b> from the
        original source file. The current revision will remain unchanged.
      </p>
      <p>
        <b>
          The new revision won&apos;t be published automatically and asset
          mappings will not be migrated to the new revision
        </b>
        .
      </p>
    </>
  );

  return (
    <Modal
      title="Reprocess the model"
      onOk={onOk}
      onCancel={onClose}
      okText="Reprocess"
      getContainer={getContainer}
      {...restProps}
    >
      <p>This model doesn&apos;t use the latest 3d format.</p>
      <p>
        We recommend you always use the latest 3D format to ensure all the
        latest features are available. You can click the &quot;Reprocess&quot;
        button below to update the model.
      </p>

      {!isReprocessable && <TooOldToReprocessMessage />}
    </Modal>
  );
};

import { getContainer, projectName } from 'utils';
import { Modal, message } from 'antd';
import React from 'react';
import { ModalProps } from 'antd/lib/modal/Modal';

import * as Sentry from '@sentry/browser';
import { requestReprocessing } from 'utils/sdk/3dApiUtils';
import sdk from '@cognite/cdf-sdk-singleton';
import { HttpError, CogniteMultiError, Revision3D } from '@cognite/sdk';
import { useHistory } from 'react-router-dom';
import { useFlag } from '@cognite/react-feature-flags';
import { createLink } from 'utils/cdf-utilities';

type Props = Omit<ModalProps, 'onOk' | 'onCancel'> & {
  modelId: number;
  revision: Revision3D;
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
  const forceNewRevision = useFlag('3DM_reprocess_force_new_revision');
  const isReprocessable =
    revision.createdTime > MAGIC_DATE && !forceNewRevision;

  const onOk = async () => {
    const progressMessage = message.loading('Requesting reprocessing...');

    onClose();

    try {
      if (!isReprocessable) {
        const createdRevision = (
          await sdk.revisions3D.create(modelId, [
            {
              camera: revision.camera,
              fileId: revision.fileId,
              metadata: revision.metadata,
              published: false, // api throws 400 if incomplete revision is published
              rotation: revision.rotation,
            },
          ])
        )[0];

        progressMessage.then(() => {
          message.success('New revision is created!');
          history.push(
            createLink(`/3d-models/${modelId}/revisions/${createdRevision.id}`)
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
      const error = e as HttpError | CogniteMultiError<any, any> | Error;

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

  if (isReprocessable) {
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
      </Modal>
    );
  }

  return (
    <Modal
      title="New revision for model"
      onOk={onOk}
      onCancel={onClose}
      okText="Crete new revision"
      getContainer={getContainer}
      {...restProps}
    >
      <p>This model doesn&apos;t use the latest 3d format.</p>
      <p>
        We recommend you always use the latest 3D format to ensure all the
        latest features are available. You can click the &quot;Create new
        revision&quot; button below to update the model.
      </p>
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
    </Modal>
  );
};

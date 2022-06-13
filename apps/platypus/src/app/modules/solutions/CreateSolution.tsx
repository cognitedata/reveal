import { Body, Detail, Icon, Input, Textarea } from '@cognite/cogs.js';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import services from '@platypus-app/di';
import { CreateSolutionModalContent } from './elements';

export const CreateSolution = ({
  createSolution,
  onCancel,
}: {
  createSolution: boolean;
  onCancel: VoidFunction;
}) => {
  const [creating, setCreating] = useState<boolean>(false);
  const [solutionName, setSolutionName] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [inputError, setInputError] = useState(false);
  const history = useHistory();
  const { t } = useTranslation('solutions');

  const solutionsHandler = services().solutionHandler;

  const onCreateSolution = () => {
    setCreating(true);
    solutionsHandler
      .create({
        name: solutionName.trim(),
        description: solutionDescription,
      })
      .then((result) => {
        setCreating(false);
        if (result.isFailure) {
          if (result.error.name) {
            setInputError(true);
          } else {
            Notification({
              type: 'error',
              message: result.error.message,
            });
          }
        } else {
          Notification({
            type: 'success',
            message: t(
              'success_solution_created',
              'Solution successfully created'
            ),
          });
          history.push(
            `solutions/${result.getValue().id}/${DEFAULT_VERSION_PATH}`
          );
        }
      });
  };

  return (
    <ModalDialog
      visible={createSolution}
      title={t('create_solution', 'Create solution')}
      onCancel={() => {
        setInputError(false);
        setSolutionName('');
        setSolutionDescription('');
        onCancel();
      }}
      onOk={() => onCreateSolution()}
      okDisabled={!solutionName || !solutionName.trim()}
      okButtonName={t('confirm', 'Confirm')}
      okProgress={creating}
      okType="primary"
    >
      <CreateSolutionModalContent data-cy="create-solution-modal">
        <Body level={2} strong>
          {t('modal_name_title', 'Name')}
        </Body>
        <Input
          fullWidth
          autoFocus
          name="solutionName"
          data-cy="input-solution-name"
          value={solutionName}
          placeholder={t('modal_name_input_placeholder', 'Enter name')}
          onChange={(e) => {
            setSolutionName(e.target.value);
            if (inputError) {
              setInputError(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onCreateSolution();
            }
          }}
          error={inputError}
        />
        <div className="input-detail">
          {inputError && <Icon type="Warning" />}
          <Detail>
            {t(
              'detail_solution_name_unique',
              "Solution's name should be unique"
            )}
          </Detail>
        </div>

        <Body level={2} strong>
          {t('modal_description_title', 'Description')}
        </Body>
        <Textarea
          name="solutionDescription"
          data-cy="input-solution-description"
          value={solutionDescription}
          onChange={(e) => setSolutionDescription(e.target.value)}
          placeholder={t(
            'modal_description_textarea_placeholder',
            'Description (optional)'
          )}
        ></Textarea>
      </CreateSolutionModalContent>
    </ModalDialog>
  );
};

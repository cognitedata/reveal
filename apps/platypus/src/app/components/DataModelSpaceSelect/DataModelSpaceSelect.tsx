import { Button, Flex, OptionType, Select, Tooltip } from '@cognite/cogs.js';
import { useState } from 'react';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  HorizontalDivider,
  InputDetail,
  StyledDetail,
  StyledIcon,
  StyledLink,
} from './elements';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { isFDMv3 } from '@platypus-app/flags';
import { CreateNewSpaceModal } from '../CreateNewSpaceModal/CreateNewSpaceModal';
import { FormLabel } from '../FormLabel/FormLabel';
import { useSpaces } from '@platypus-app/hooks/useSpaces';

export type DataModelSpaceSelectProps = {
  isDisabled?: boolean;
  onSpaceSelect: (selectedSpace: string) => void;
  preSelectedSpace?: string;
};

export const DataModelSpaceSelect = (props: DataModelSpaceSelectProps) => {
  const { t } = useTranslation('DataModelSpaceSelect');
  const isFDMV3 = isFDMv3();
  const [userCanCreateSpace, setUserCanCreateSpace] = useState(true);

  const { data: spaces, isFetching: isSpacesLoading, error } = useSpaces();

  const spaceOptions = (spaces || []).map(
    (item) =>
      ({
        label: item.name || item.space,
        value: item.space,
      } as OptionType<string>)
  );

  const [selectedSpace, setSelectedSpace] = useState<
    OptionType<string> | undefined
  >(
    props.preSelectedSpace
      ? { label: props.preSelectedSpace, value: props.preSelectedSpace }
      : undefined
  );

  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);

  if (!isFDMV3) return null;

  return (
    <>
      <HorizontalDivider />

      <Flex>
        <FormLabel level={2} strong required>
          {t('modal_space_title', 'Space')}
        </FormLabel>
        <Tooltip
          interactive
          sticky
          wrapped
          position="bottom"
          content={
            <span key={'space_title_tooltip_content_ctr'}>
              {t(
                'space_title_tooltip_text',
                'All data models and data must belong to a space. For each space, you can grant read and write access to the data, the data model only, or both.'
              )}{' '}
              <br />
              <br />
              <StyledLink
                href="https://docs.cognite.com/cdf/data_modeling/"
                target="_blank"
              >
                {t('spaces_docs_link_text', 'Go to documentation')}
              </StyledLink>
            </span>
          }
        >
          <StyledIcon type="InfoFilled" size={12} />
        </Tooltip>
      </Flex>

      <Select
        fullWidth
        disabled={props.isDisabled}
        name="space"
        data-cy="select-space-dropdown"
        options={spaceOptions}
        isMulti={false}
        value={selectedSpace}
        placeholder={t('modal_space_input_placeholder', 'Select space')}
        onChange={(spaceOption: OptionType<string>) => {
          setSelectedSpace(spaceOption);
          props.onSpaceSelect(spaceOption.value || '');
        }}
        noOptionsMessage={() =>
          isSpacesLoading ? (
            <Spinner />
          ) : error ? (
            <span>
              {t(
                'spaces_error',
                error.name || error.message || JSON.stringify(error)
              )}
            </span>
          ) : (
            <span>{t('no_results_for_space_search', 'No spaces found')}</span>
          )
        }
        menuFooter={
          userCanCreateSpace
            ? ((
                <Button
                  iconPlacement="left"
                  icon="Add"
                  onClick={() => setShowCreateSpaceModal(true)}
                  data-cy="create-space-btn"
                >
                  {t('create_new_space_btn_text', 'Create new space')}
                </Button>
              ) as unknown as HTMLButtonElement)
            : undefined
        }
        menuPortalTarget={document.body}
        menuPlacement="top"
      />
      {!props.isDisabled && (
        <InputDetail>
          <StyledDetail>
            {t(
              'modal_space_description',
              'You need to select a space where your data model will be stored.'
            )}
          </StyledDetail>
        </InputDetail>
      )}

      <CreateNewSpaceModal
        visible={showCreateSpaceModal}
        onCancel={() => setShowCreateSpaceModal(false)}
        onSpaceCreated={(newSpace) => {
          setSelectedSpace({
            label: newSpace,
            value: newSpace,
          });
          props.onSpaceSelect(newSpace || '');
          setShowCreateSpaceModal(false);
        }}
      />
    </>
  );
};

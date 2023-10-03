import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import {
  Button,
  Chip,
  ChipGroup,
  Dropdown,
  Icon,
  Input,
  Menu,
  toast,
} from '@cognite/cogs.js';
import type { LabelDetails, ModelFile } from '@cognite/simconfig-api-sdk/rtk';
import {
  useCreateLabelMutation,
  useGetLabelsListQuery,
  useUpdateModelFileLabelsMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from '../../../store/simconfigApiProperties/selectors';
import { LabelsModal } from '../../LabelsModal';

interface ModelLabelsProps {
  modelFile: ModelFile;
  refetchModelFiles: () => void;
}

export function ModelLabels({
  modelFile,
  refetchModelFiles,
}: ModelLabelsProps) {
  const project = useSelector(selectProject);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [updateModelLabels, { isSuccess }] = useUpdateModelFileLabelsMutation();
  const [createLabel] = useCreateLabelMutation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const modelName = modelFile.name;
  const [selectedLabels, setSelectedLabels] = useState<
    { label: string; value: string }[]
  >([]);
  const { data: labelsList } = useGetLabelsListQuery({ project });
  const currentExternalIds = selectedLabels.map((label) => label.value);
  const dropdownOptions = labelsList?.labels
    ?.filter((label) => !currentExternalIds.includes(label.externalId ?? ''))
    .filter((label) =>
      label.name?.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

  const getLabel = (
    externalId: string | undefined,
    labelsList: LabelDetails[] | undefined
  ) => {
    if (!labelsList || !externalId) {
      return 'N/A';
    }
    return (
      labelsList.find((label) => label.externalId === externalId)?.name ?? 'N/A'
    );
  };

  useEffect(() => {
    setSelectedLabels(
      modelFile.labels
        ? modelFile.labels.map((label) => ({
            value: label.externalId ?? 'N/A',
            label: getLabel(label.externalId, labelsList?.labels),
          }))
        : []
    );
  }, [modelFile, labelsList]);

  useEffect(() => {
    if (isSuccess) {
      refetchModelFiles();
    }
  }, [isSuccess, refetchModelFiles]);

  const update = async (labels: { label: string; value: string }[]) => {
    setSelectedLabels(labels);
    const currentLabels = labels.map((label) => ({
      labelName: label.label,
    }));
    await updateModelLabels({
      project,
      modelName,
      updateModelFileLabelsRequestModel: { labels: currentLabels },
    });
  };

  const removeLabelFromModel = (externalId: string) => {
    const current = selectedLabels.filter(
      (label) => label.value !== externalId
    );
    void update(current);
  };

  const addLabelToModel = (externalId: string) => {
    const nextLabel = labelsList?.labels?.find(
      (label) => label.externalId === externalId
    );
    const current = [
      ...selectedLabels,
      { label: nextLabel?.name ?? '', value: nextLabel?.externalId ?? '' },
    ];
    void update(current);
  };

  const handleLabelCreation = async () => {
    await createLabel({
      project,
      createLabelModel: { labels: [{ name: searchTerm.trim() }] },
    });
    setSearchTerm('');
  };

  return (
    <ModelLabelsContainer>
      <LabelsModal isOpen={isOpen} setOpen={setOpen} />
      <LabelsLine>
        <ChipGroup
          overflow={3}
          size="medium"
          onRemoveChip={(chipName) => {
            if (chipName) {
              removeLabelFromModel(chipName);
              toast.success('Label is removed');
            }
          }}
        >
          {selectedLabels.map((label) => (
            <Chip
              key={label.value}
              label={label.label}
              name={label.value}
              type="neutral"
              hideTooltip
            />
          ))}
        </ChipGroup>

        <Dropdown
          content={
            <Menu>
              <Input
                className="add-label-button"
                icon="Search"
                iconPlacement="left"
                style={{
                  width: '100%',
                }}
                value={searchTerm}
                onChange={(ev) => {
                  setSearchTerm(ev.target.value);
                }}
              />
              <LabelsListDropdown>
                {dropdownOptions?.map((label) => (
                  <li key={label.externalId}>
                    <div
                      aria-hidden
                      onClick={() => {
                        addLabelToModel(label.externalId ?? '');
                      }}
                    >
                      <span>{label.name}</span>
                      <Icon type="Add" />
                    </div>
                  </li>
                ))}
              </LabelsListDropdown>
              {dropdownOptions?.length === 0 &&
                !selectedLabels.some((label) => label.label === searchTerm) && (
                  <>
                    {labelsList?.labels?.length !== 0 &&
                      searchTerm.length > 0 && (
                        <NoResultsMessage>No results</NoResultsMessage>
                      )}
                    <CreateLabelButton
                      disabled={!(searchTerm.length > 0)}
                      type="primary"
                      onClick={handleLabelCreation}
                    >
                      {searchTerm.length > 0 ? (
                        <>
                          Add <span>{`"${searchTerm}"`}</span>
                        </>
                      ) : (
                        'Type to create'
                      )}
                    </CreateLabelButton>
                  </>
                )}
              <Button
                icon="Tag"
                onClick={() => {
                  setOpen(true);
                }}
              >
                Manage labels
              </Button>
            </Menu>
          }
          maxWidth={195}
          {...(isOpen && { visible: !isOpen })}
          hideOnClick
        >
          <Button
            icon="Tag"
            style={{ marginLeft: '8px' }}
            onClick={() => {
              const [dropdownInput] = document.querySelectorAll(
                '.add-label-button input'
              );
              inputRef.current = dropdownInput as HTMLInputElement;
              inputRef.current.focus();
            }}
          />
        </Dropdown>
      </LabelsLine>
    </ModelLabelsContainer>
  );
}

const ModelLabelsContainer = styled.div``;

const LabelsLine = styled.div`
  width: 80%;
  margin-right: 0.5em;
  display: flex;
  flex-wrap: nowrap;
  align-content: center;
  align-self: center;
  vertical-align: center;
`;

const CreateLabelButton = styled(Button)`
  min-width: 179px;
  max-width: 179px;
  margin-bottom: 16px;
  span {
    margin-left: 0.25em;
    max-width: 90px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const LabelsListDropdown = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 0.75em;
  margin-bottom: 0px;
  overflow: scroll;
  max-height: 165px;
  width: 100%;
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
  li {
    border: 1px solid var(--cogs-greyscale-grey4);
    margin-bottom: 0.5em;
    height: 36px;
    border-radius: 6px;
    transition: border 0.2s;
    font-size: 14px;
    cursor: pointer;
    padding: 8px;
    &:hover {
      border: 2px solid #4a67fb;
      i {
        color: #4078f0;
      }
    }

    div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      span {
        max-width: 130px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
`;

const NoResultsMessage = styled.span`
  margin-bottom: 16px;
  color: #595959;
  padding-left: 8px;
`;

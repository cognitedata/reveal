import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import {
  Button,
  Dropdown,
  Icon,
  Input,
  Label,
  Menu,
  toast,
} from '@cognite/cogs.js';
import type { LabelDetails, ModelFile } from '@cognite/simconfig-api-sdk/rtk';
import {
  useCreateLabelMutation,
  useGetLabelsListQuery,
  useUpdateModelFileLabelsMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

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
        {selectedLabels.length > 0 &&
          selectedLabels.slice(0, 2).map((label) => (
            <LabelItem key={label.value} marginLeft={8}>
              {' '}
              <span className="label-name">{label.label}</span>
              <Icon
                className="remove-label-icon"
                type="Close"
                onClick={() => {
                  removeLabelFromModel(label.value);
                  toast.success('Label is removed');
                }}
              />
            </LabelItem>
          ))}

        {selectedLabels.length > 2 && (
          <Dropdown
            content={
              <Menu>
                {selectedLabels
                  .slice(2, selectedLabels.length)
                  .map((label, idx) => (
                    <LabelItem key={label.value} marginTop={idx !== 0 ? 8 : 0}>
                      {' '}
                      <span className="label-name">{label.label}</span>
                      <Icon
                        className="remove-label-icon"
                        type="Close"
                        onClick={() => {
                          removeLabelFromModel(label.value);
                          toast.success('Label is removed');
                        }}
                      />
                    </LabelItem>
                  ))}
              </Menu>
            }
          >
            <LabelItem marginLeft={8}>
              +{selectedLabels.length - 2}
              <Icon type="ChevronDown" />
            </LabelItem>
          </Dropdown>
        )}

        <Dropdown
          content={
            <Menu>
              <Input
                className="add-label-button"
                icon="Search"
                iconPlacement="left"
                style={{
                  width: 179,
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
          <AddLabelButton
            icon="Tag"
            size="large"
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

const LabelItem = styled(Label)<{
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
}>`
  color: #396bd7;
  height: 28px;
  background-color: rgba(64, 120, 240, 0.1);
  transition: background-color 0.25s;
  font-size: 13px;
  &:hover {
    background-color: rgba(64, 120, 240, 0.2);
  }
  margin-left: ${(p) => p.marginLeft}px;
  margin-right: ${(p) => p.marginRight}px;
  margin-top: ${(p) => p.marginTop}px;
  .cogs-icon {
    cursor: pointer;
    margin-left: 9.5px;
  }
  .label-name {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; // Only display the text in one line
  }
`;

const AddLabelButton = styled(Button)`
  color: #4a67fb;
  border: 0;
  height: 28px;
  margin-left: 8px !important;
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

import { AutoComplete, Button, OptionType } from '@cognite/cogs.js';
import { CustomAnnotationCreateOption } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/AnnotationEditPopupCustomComponents/CustomAnnotationCreateOption';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { OptionProps } from 'react-select';
import { VisionOptionType } from 'src/modules/Review/types';
import React, { MouseEventHandler } from 'react';
import styled from 'styled-components';

export const CustomAnnotationAutoComplete = ({
  value,
  options,
  onChange,
  placeholder,
  maxHeight,
  onClickCreateNew,
}: {
  value: OptionType<string>;
  options: VisionOptionType<string>[];
  onChange: (value: Required<OptionType<string>>) => void;
  placeholder?: string;
  maxHeight?: number;
  onClickCreateNew?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <AutoComplete
      placeholder={placeholder}
      value={value}
      closeMenuOnSelect
      onChange={onChange}
      options={options}
      maxMenuHeight={maxHeight}
      components={{
        MenuList: (props: any) => {
          return (
            <>
              <CustomMenuList>{props.children}</CustomMenuList>
              <CustomMenuFooter>
                <CustomAnnotationCreateOption
                  {...props}
                  data={{
                    icon:
                      props.selectProps.inputValue !== ''
                        ? AnnotationUtils.getIconType({
                            text: props.selectProps.inputValue,
                            modelType: VisionAPIType.ObjectDetection,
                          })
                        : null,
                    color: AnnotationUtils.getAnnotationColor(
                      props.selectProps.inputValue || '',
                      VisionAPIType.ObjectDetection,
                      { keypoint: true }
                    ),
                  }}
                >
                  <OptionContainer>
                    <InputTextLabel>
                      {props.selectProps.inputValue}
                    </InputTextLabel>
                    <CreateNewLabelBtn
                      className="create-pred-lbl-btn"
                      type="primary"
                      icon="PlusCompact"
                      size="small"
                      onClick={onClickCreateNew}
                      tabIndex={0}
                    >
                      Create New
                    </CreateNewLabelBtn>
                  </OptionContainer>
                </CustomAnnotationCreateOption>
              </CustomMenuFooter>
            </>
          );
        },
        Option: (props: OptionProps<OptionType<VisionOptionType<string>>>) => {
          return <CustomAnnotationCreateOption {...props} />;
        },
        NoOptionsMessage: () => {
          return null;
        },
      }}
    />
  );
};

const CustomMenuList = styled.div`
  max-height: 160px;
  overflow-y: auto;
  padding-bottom: 4px;
  padding-top: 4px;
  position: relative;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
`;

const OptionContainer = styled.div`
  display: grid;
  grid-template-rows: 100%;
  grid-template-columns: auto auto;
  width: 100%;
`;

const InputTextLabel = styled.span`
  overflow-x: hidden;
  width: 80px;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

const CustomMenuFooter = styled.div`
  width: 100%;
`;

const CreateNewLabelBtn = styled(Button)`
  min-width: 120px;
`;

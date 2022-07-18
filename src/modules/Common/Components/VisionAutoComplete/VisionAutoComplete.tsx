import { AutoComplete, Button, OptionType } from '@cognite/cogs.js';
import React from 'react';
import { OptionProps } from 'react-select';
import { VisionSelectOption } from 'src/modules/Common/Components/SelectOption/VisionSelectOption';
import { VisionOptionType } from 'src/modules/Review/types';
import useColorForLabel from 'src/store/hooks/useColorForLabel';
import { getIcon } from 'src/utils/iconUtils';
import styled from 'styled-components';

export const VisionAutoComplete = ({
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
  onClickCreateNew?: (text: string) => void;
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
          const color = useColorForLabel(props.selectProps.inputValue || '');
          return (
            <>
              <CustomMenuList>{props.children}</CustomMenuList>
              <CustomMenuFooter>
                <VisionSelectOption
                  {...props}
                  data={{
                    icon: getIcon(props.selectProps.inputValue),
                    color,
                  }}
                >
                  <OptionContainer>
                    <InputTextLabel>
                      {props.selectProps.inputValue}
                    </InputTextLabel>
                    <CreateNewLabelBtn
                      className="create-pred-lbl-btn"
                      type="primary"
                      icon="Add"
                      size="small"
                      onClick={() =>
                        onClickCreateNew &&
                        onClickCreateNew(props.selectProps.inputValue)
                      }
                      tabIndex={0}
                    >
                      Create New
                    </CreateNewLabelBtn>
                  </OptionContainer>
                </VisionSelectOption>
              </CustomMenuFooter>
            </>
          );
        },
        Option: (props: OptionProps<OptionType<VisionOptionType<string>>>) => {
          return <VisionSelectOption {...props} />;
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
  place-items: center start;
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

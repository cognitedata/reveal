import { AutoComplete, Button, OptionType } from '@cognite/cogs.js';
import React from 'react';
import { OptionProps } from 'react-select';
import { VisionSelectOption } from 'src/modules/Common/Components/SelectOption/VisionSelectOption';
import { VisionOptionType } from 'src/modules/Review/types';
import useColorForLabel from 'src/store/hooks/useColorForLabel';
import { getIcon } from 'src/utils/iconUtils';
import styled from 'styled-components';

const CUSTOM_FOOTER_HEIGHT = 44;
const DEFAULT_MENU_HEIGHT = 160;
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
  const maxMenuheight =
    (maxHeight || DEFAULT_MENU_HEIGHT) - CUSTOM_FOOTER_HEIGHT;
  return (
    <AutoComplete
      placeholder={placeholder}
      value={value}
      closeMenuOnSelect
      onChange={onChange}
      options={options}
      maxMenuHeight={maxMenuheight}
      components={{
        MenuList: (props: any) => {
          const color = useColorForLabel(props.selectProps.inputValue || '');
          return (
            <>
              <CustomMenuList maxHeight={maxMenuheight}>
                {props.children}
              </CustomMenuList>
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

interface MenuProps {
  maxHeight: number;
}

const CustomMenuList = styled.div<MenuProps>`
  max-height: ${(props) => props.maxHeight}px;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
`;

const OptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InputTextLabel = styled.span`
  overflow-x: hidden;
  width: 145px;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

const CustomMenuFooter = styled.div`
  width: 100%;

  .cogs-select__option {
    padding: 8px 0 0 10px;
  }
`;

const CreateNewLabelBtn = styled(Button)`
  min-width: 120px;
`;

import { OptionType, Select } from '@cognite/cogs.js';
import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { Component } from 'react';
import styled from 'styled-components';

type Option = OptionType<any>;

interface SelectCellEditorState {
  selectedOption: Option | undefined;
}

interface SelectCellEditorProps extends ICellEditorParams {
  options: Option[];
}

export default class SelectCellEditor
  extends Component<SelectCellEditorProps, SelectCellEditorState>
  implements ICellEditor
{
  constructor(props: SelectCellEditorProps) {
    super(props);

    const selectedOption = props.options.find(
      (option) => option.value === props.value
    );

    this.state = {
      selectedOption,
    };
  }

  /* Component Editor Lifecycle methods */
  // the final value to send to the grid, on completion of editing
  getValue() {
    return this.state.selectedOption?.value;
  }

  render() {
    return (
      <Wrapper>
        <Select
          menuIsOpen
          isOptionSelected={(option: Option) =>
            option.value === this.state.selectedOption?.value
          }
          onChange={(option: Option) => {
            this.setState({ selectedOption: option }, () => {
              this.props.stopEditing();
            });
          }}
          options={this.props.options}
          value={this.state.selectedOption}
        />
      </Wrapper>
    );
  }
}

const Wrapper = styled.div`
  background-color: white;
  margin: 6px 5px;
  width: 190px;
`;

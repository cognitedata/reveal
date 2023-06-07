import { ChangeEvent, Component, createRef } from 'react';

import { ICellEditor, ICellEditorParams } from 'ag-grid-community';

import { ColumnDataType } from '../core/types';

import { CellEditorWrapper } from './ui';

interface TextCellEditorState {
  value: string;
  hasError: boolean;
  errorMessage: string;
}

export class TextCellEditor
  extends Component<
    ICellEditorParams & { dataType: ColumnDataType },
    TextCellEditorState
  >
  implements ICellEditor
{
  private inputRef: any;

  constructor(props: ICellEditorParams & { dataType: ColumnDataType }) {
    super(props);

    this.inputRef = createRef();

    this.state = {
      value: printValue(props.value || '', props.dataType),
      hasError: false,
      errorMessage: '',
    };

    this.onValueChanged = this.onValueChanged.bind(this);
    this.isValueValid = this.isValueValid.bind(this);
    this.focusIn = this.focusIn.bind(this);
  }

  componentDidMount() {
    if (this.props.cellStartedEdit) this.focusIn();
  }

  componentDidUpdate() {
    this.props.eGridCell.classList.remove('ag-cell-has-error');
    if (this.state.hasError)
      this.props.eGridCell.classList.add('ag-cell-has-error');
  }

  focusIn() {
    this.inputRef.current.focus();
    this.inputRef.current.select();
  }

  /* Component Editor Lifecycle methods */
  // the final value to send to the grid, on completion of editing
  getValue() {
    return processValue(this.state.value, this.props.dataType);
  }

  // Gets called once before editing starts, to give editor a chance to
  // cancel the editing before it even starts.
  isCancelBeforeStart() {
    return false;
  }

  // Gets called once when editing is finished (eg if Enter is pressed).
  // If you return true, then the result of the edit will be ignored.
  isCancelAfterEnd() {
    const { hasError } = this.isValueValid(this.state.value);
    return hasError;
  }

  onValueChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    const { hasError, errorMessage } = this.isValueValid(event.target.value);

    this.setState({
      value: event.target.value,
      hasError,
      errorMessage,
    });
  }

  private isValueValid(value: string): {
    hasError: boolean;
    errorMessage: string;
  } {
    if (this.props.colDef.cellEditorParams.isRequired) {
      return {
        hasError: !value,
        errorMessage: `Field ${this.props.colDef.headerName} is required`,
      };
    }
    if (
      !validateValue(
        value,
        this.props.colDef.cellEditorParams.isRequired,
        this.props.dataType
      )
    ) {
      return {
        hasError: true,
        errorMessage: `Field ${this.props.colDef.headerName} has unallowed values`,
      };
    }
    return {
      hasError: false,
      errorMessage: '',
    };
  }

  render() {
    return (
      <CellEditorWrapper
        key={`${this.props.data.externalId}-${this.props.colDef.headerName}`}
        visible={this.state.hasError}
        errorMessage={this.state.errorMessage}
      >
        <textarea
          ref={this.inputRef}
          value={this.state.value}
          onChange={this.onValueChanged}
          className={`ag-cell-editor ${
            this.state.hasError ? 'ag-has-error' : ''
          }`}
        />
      </CellEditorWrapper>
    );
  }
}

const validateValue = (
  value: string,
  isRequired: boolean,
  type: ColumnDataType
) => {
  if (!isRequired && value.trim().length === 0) {
    return true;
  }
  switch (type) {
    case ColumnDataType.Json:
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    case ColumnDataType.Date:
    case ColumnDataType.DateTime:
    case ColumnDataType.Time:
      return !Number.isNaN(new Date(value));
    default:
      return value.trim().length > 0;
  }
};
const processValue = (value: any, type: ColumnDataType) => {
  if (!value) {
    return null;
  }
  switch (type) {
    case ColumnDataType.Custom:
      return { externalId: value.trim() };
    case ColumnDataType.Date:
      return new Date(value).toISOString().split('T')[0];
    case ColumnDataType.DateTime:
      return new Date(value).toISOString();
    case ColumnDataType.Time:
      return new Date(value).toISOString();
    case ColumnDataType.Json:
      return JSON.parse(value);
    default:
      return value.trim();
  }
};

const printValue = (value: any, type: ColumnDataType) => {
  switch (type) {
    case ColumnDataType.Custom:
      return value ? value.externalId : undefined;
    case ColumnDataType.Json:
      if (value) {
        if (typeof value !== 'string') {
          return JSON.stringify(value);
        }
        try {
          return JSON.stringify(JSON.parse(value));
        } catch {
          return value;
        }
      }
      return undefined;
    default:
      return value;
  }
};

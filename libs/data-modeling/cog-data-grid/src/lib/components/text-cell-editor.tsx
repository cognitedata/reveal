import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { ChangeEvent, Component, createRef } from 'react';
import { CellEditorWrapper } from './ui';

interface TextCellEditorState {
  value: string;
  hasError: boolean;
  errorMessage: string;
}

export class TextCellEditor
  extends Component<ICellEditorParams, TextCellEditorState>
  implements ICellEditor
{
  private inputRef: any;

  constructor(props: ICellEditorParams) {
    super(props);

    this.inputRef = createRef();

    this.state = {
      value: String(props.value || ''),
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
    return this.state.value;
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

import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { ChangeEvent, Component, createRef } from 'react';
import { decimalValueFormatter } from '../core/utils';
import { CellEditorWrapper } from './ui';

interface NumberColTypeCellEditorState {
  value: string;
  hasError: boolean;
  errorMessage: string;
}

interface NumberCellEditorProps extends ICellEditorParams {
  allowDecimals?: boolean;
}
export class NumberCellEditor
  extends Component<NumberCellEditorProps, NumberColTypeCellEditorState>
  implements ICellEditor
{
  private inputRef: any;
  private allowDecimals = false;
  private isDecimalRegExp = /^\d+(\.\d{1,})?$/;
  private isNumberRegExp = /^\d+$/;

  constructor(props: NumberCellEditorProps) {
    super(props);

    this.inputRef = createRef();

    this.state = {
      value: decimalValueFormatter({
        value: props.value,
        isFloat: props.allowDecimals,
      }),
      hasError: false,
      errorMessage: '',
    };
    this.allowDecimals = props.allowDecimals === true;
    this.onValueChanged = this.onValueChanged.bind(this);
    this.preventInvalidInput = this.preventInvalidInput.bind(this);
    this.isValueValid = this.isValueValid.bind(this);
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
    if (!this.props.colDef.cellEditorParams.isRequired && !this.state.value)
      return this.state.value;

    return +this.state.value;
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
      value: !event.target.value ? '' : event.target.value,
      hasError,
      errorMessage,
    });
  }

  preventInvalidInput(event: any) {
    const whitelistedKeyCodes = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Delete',
      'Enter',
      'Escape',
      'Backspace',
      'Tab',
    ];
    if (whitelistedKeyCodes.includes(event.code || event.key)) {
      return;
    }

    const checkDecimalsPtn = /[\d\\.]/;
    const checkNumbersPtn = /\d/;

    if (
      event.key.search(
        this.allowDecimals ? checkDecimalsPtn : checkNumbersPtn
      ) === -1
    ) {
      event.preventDefault();
    }
  }

  private isValueValid(value: string): {
    hasError: boolean;
    errorMessage: string;
  } {
    const checkNumericValueRegExp = this.allowDecimals
      ? this.isDecimalRegExp
      : this.isNumberRegExp;

    if (this.props.colDef.cellEditorParams.isRequired) {
      return {
        hasError: !checkNumericValueRegExp.test(value),
        errorMessage: `Field ${this.props.colDef.headerName} is required`,
      };
    }

    if (!this.props.colDef.cellEditorParams.isRequired && !value) {
      return {
        hasError: false,
        errorMessage: '',
      };
    }

    return {
      hasError: !checkNumericValueRegExp.test(value),
      errorMessage: !checkNumericValueRegExp.test(value) ? 'Invalid value' : '',
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
          onKeyDown={this.preventInvalidInput}
          className={`ag-cell-editor ${
            this.state.hasError ? 'ag-has-error' : ''
          }`}
        />
      </CellEditorWrapper>
    );
  }
}

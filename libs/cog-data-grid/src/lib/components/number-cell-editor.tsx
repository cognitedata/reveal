import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { ChangeEvent, Component, createRef } from 'react';

interface NumberColTypeCellEditorState {
  value: string;
  hasError: boolean;
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
  private isDecimalPtn = /^\d+(\.\d{1,})?$/;
  private isNumberPtn = /^\d+$/;

  constructor(props: NumberCellEditorProps) {
    super(props);

    this.inputRef = createRef();

    this.state = {
      value: props.value.toString(),
      hasError: false,
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
    setTimeout(() => this.inputRef.current.select());
  }

  /* Component Editor Lifecycle methods */
  // the final value to send to the grid, on completion of editing
  getValue() {
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
    const isValid = this.isValueValid(this.state.value);
    return isValid ? true : false;
  }

  onValueChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    const hasErrors = this.isValueValid(event.target.value);

    this.setState({
      value: !event.target.value ? '' : event.target.value,
      hasError: hasErrors,
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
    if (whitelistedKeyCodes.includes(event.code)) {
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

  private isValueValid(value: string): boolean {
    const ptn = this.allowDecimals ? this.isDecimalPtn : this.isNumberPtn;
    return !ptn.test(value);
  }

  render() {
    return (
      <textarea
        ref={this.inputRef}
        value={this.state.value}
        onChange={this.onValueChanged}
        onKeyDown={this.preventInvalidInput}
        className={`ag-cell-editor ${
          this.state.hasError ? 'ag-has-error' : ''
        }`}
      ></textarea>
    );
  }
}

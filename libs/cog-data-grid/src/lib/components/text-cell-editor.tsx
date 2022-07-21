import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { ChangeEvent, Component, createRef } from 'react';

interface TextCellEditorState {
  value: string;
  hasError: boolean;
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
      value: props.value.toString(),
      hasError: false,
    };

    this.onValueChanged = this.onValueChanged.bind(this);
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

  private isValueValid(value: string): boolean {
    return !value;
  }

  render() {
    return (
      <textarea
        ref={this.inputRef}
        value={this.state.value}
        onChange={this.onValueChanged}
        className={`ag-cell-editor ${
          this.state.hasError ? 'ag-has-error' : ''
        }`}
      ></textarea>
    );
  }
}

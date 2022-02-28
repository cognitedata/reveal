import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { Component, createRef } from 'react';

interface TextColTypeCellEditorState {
  value: string;
}
export class TextCellEditor
  extends Component<ICellEditorParams, TextColTypeCellEditorState>
  implements ICellEditor
{
  private inputRef: any;
  constructor(props: ICellEditorParams) {
    super(props);

    this.inputRef = createRef();

    this.state = {
      value: props.value,
    };
    console.log(this.props);
  }

  componentDidMount() {
    this.inputRef.current.focus();
    console.log('component is up and running');
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
    return false;
  }

  render() {
    return (
      <input
        ref={this.inputRef}
        value={this.state.value}
        onChange={(event) => this.setState({ value: event.target.value })}
        style={{ width: '100%' }}
      />
    );
  }
}

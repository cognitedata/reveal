import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IVisualizerState } from "@/UserInterface/Redux/State/visualizer";
import { BaseCommand } from '@/Core/Commands/BaseCommand';
import Viewer from '@/UserInterface/Components/Viewers/Viewer';
import ViewerUtils from '@/UserInterface/NodeVisualizer/Viewers/ViewerUtils';

// Initial settings state
const initialState: IVisualizerState = {
  viewers: {},
  statusBar: {
    text: ""
  }
};

export const visualizerSlice = createSlice({
  name: "visualizer",
  initialState,
  reducers: {
    initializeToolbarStatus:  { 
      reducer:(state: IVisualizerState, action: PayloadAction<{viewers: {[key: string]: Viewer }}>) =>
      {
        for (const viewer of Object.values(action.payload.viewers))
        {
          const viewerName = viewer.getName();
          const toolbar = viewer.getToolbarCommands();
          state.viewers[viewerName] = [];
          if(toolbar){
            toolbar.forEach((item: BaseCommand) => {
              state.viewers[viewerName].push(populateToolCommandState(item));
            });
          }
        }
      },
      prepare: (): { payload: {viewers: {[key: string]: Viewer }} } => {
        return { payload: { viewers: ViewerUtils.getViewers() } }; 
      } },

    executeVisualizerToolbarCommand: {
      reducer: (state: IVisualizerState, action: PayloadAction<{ visualizerId: string, index:number, toolCommand: BaseCommand | null}>) =>
      {
        const { visualizerId, index, toolCommand } = action.payload;
        if(toolCommand)
          state.viewers[visualizerId][index] = populateToolCommandState(toolCommand);
      },
      prepare: (visualizerId: string, index: number, event?: any): {payload: { visualizerId: string, index:number, toolCommand: BaseCommand | null}} => {
        const toolbar = ViewerUtils.getViewers()[visualizerId].getToolbarCommands();

        if (!toolbar)
          return { payload: { visualizerId, index, toolCommand: null } }; 

        const toolCommand = toolbar[index];  
        if (event){
          toolCommand.invokeValue(event.target.value);
        }else{
          toolCommand.invoke();
        }
        return { payload: { visualizerId, index, toolCommand } }; 
      }
    },

    updateStatusPanel: (state: IVisualizerState, action: PayloadAction<{ text: string}>) =>
    { 
      state.statusBar.text = action.payload.text;
    }
  },
});

function populateToolCommandState(item: BaseCommand){
  return {
    isChecked: item.isChecked,
    icon: item.getIcon(),
    isVisible: item.isVisible,
    isDropdown: item.isDropdown,
    value: item.value,
    tooltip: item.getTooltip(),
    dropdownOptions: item.dropdownOptions
  };
}

export default visualizerSlice.reducer;
export const { initializeToolbarStatus, executeVisualizerToolbarCommand, updateStatusPanel } = visualizerSlice.actions;

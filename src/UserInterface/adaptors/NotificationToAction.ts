import { Dispatch } from 'redux'
import { Changes } from '@/Core/Views/Changes'
import { CheckBoxState } from '@/Core/Enums/CheckBoxState'

export const CHANGE_CHECKBOX_STATE: string = "CHANGE_CHECKBOX_STATE";

const mapToCheckboxStateStr = (cbState: CheckBoxState) => {
    switch(cbState) {
        case CheckBoxState.All: return 'checked';
        case CheckBoxState.None: return 'unchecked';
        case CheckBoxState.Disabled: return 'disabled';
        case CheckBoxState.Some: return 'partial';
        default: return 'undefined';
    }
};

class NotificationsToActionsAdaptor {

    private readonly dispatcher: Dispatch;

    public constructor(dispatcher: Dispatch) {
        this.dispatcher = dispatcher;
    }

    processEvent(sender: import("../../Core/Nodes/BaseNode").BaseNode, args: import("../../Core/Views/NodeEventArgs").NodeEventArgs): void {
        console.log('notification ', sender, args);
        if(args.isEmpty) { return; }

        // test for all changes that are relevant for us
        if (args.isChanged(Changes.visibleState)) {
            this.dispatcher(changeCheckboxState(sender.uniqueId.toString(), mapToCheckboxStateStr(sender.getCheckBoxState())));
        } else {
            //TODO: handle other conversions
        }
    }
}


const changeCheckboxState = (appliesTo: string, payload: any) => {
    return { type: CHANGE_CHECKBOX_STATE, appliesTo: appliesTo, payload: payload};
};

export default NotificationsToActionsAdaptor;


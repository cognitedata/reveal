import { Dispatch } from 'redux'
import { Changes } from '@/Core/Views/Changes'
import { CheckBoxState } from '@/Core/Enums/CheckBoxState'
import { setFullScreeen } from "@/UserInterface/redux/actions/common";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

export const CHANGE_CHECKBOX_STATE: string = "CHANGE_CHECKBOX_STATE";

const mapToCheckboxStateStr = (cbState: CheckBoxState) => {
    switch (cbState) {
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

    processEvent(sender: BaseNode, args: NodeEventArgs): void {
        // console.log('notification ', sender, args);
        if(args.isEmpty) { return; }

        // test for all changes that are relevant for us
        if (args.isChanged(Changes.visibleState)) {
            this.dispatcher(changeCheckboxState(sender.uniqueId.toString(), mapToCheckboxStateStr(sender.getCheckBoxState())));
        } else {
            //TODO: handle other conversions
        }
    }

    setFullScreeen(isFullScreen: boolean) {
        this.dispatcher(setFullScreeen(isFullScreen));
    }
}


const changeCheckboxState = (appliesTo: string, payload: any) => {
    return { type: CHANGE_CHECKBOX_STATE, appliesTo, payload };
};

export default NotificationsToActionsAdaptor;


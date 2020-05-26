import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Icon from '@/UserInterface/components/Common/Icon';
import { ReduxStore } from "@/UserInterface/interfaces/common";
import { changeNodeType } from "@/UserInterface/redux/actions/explorer";

// Renders Explorer Tabs
export default function NodeTabs() {

    const explorer = useSelector((state: ReduxStore) => state.explorer);
    const dispatch = useDispatch();

    const tabConfig = explorer.tabConfig;

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        dispatch(changeNodeType({
            nodeTypeIndex: newValue,
            nodeType: tabConfig![newValue].value
        }))
    };

    if (!tabConfig) return null;
    return (
        <div className="node-tabs">
            <Tabs
                value={explorer.selectedNodeType.value}
                indicatorColor="primary"
                textColor="primary"
                onChange={handleChange}>
                {tabConfig.map((nodeType, idx) =>
                    <Tab key={`node-type-${idx}`} label={
                        <div className="node-tab">
                            <Icon type={nodeType.icon.type} name={nodeType.icon.name}></Icon>
                            <span>{nodeType.name}</span>
                        </div>}
                    />)}
            </Tabs>
        </div>
    );
}

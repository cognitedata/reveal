//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { BaseNode } from "./BaseNode";
import { IVisibilityContext } from "../Architecture/IVisibilityContext";
import { ViewFactory } from "../Architecture/ViewFactory";
import { ViewList } from "../Architecture/ViewList";
import { BaseView } from "../Views/BaseView";
import { TargetId } from "../Core/TargetId";


export abstract class TargetNode extends BaseNode implements IVisibilityContext
{
    //==================================================
    // CONSTRUCTORS
    //==================================================

    public constructor() { super(); }

    //==================================================
    // FIELDS
    //==================================================

    private _viewsShownHere: ViewList = new ViewList();

    //==================================================
    // PROPERTIES
    //==================================================

    public get viewsShownHere(): ViewList { return this._viewsShownHere; }
    public get targetId(): TargetId { return new TargetId(this.className, this.uniqueId); }

    //==================================================
    // OVERRIDES of Identifiable
    //==================================================

    public /*override*/ get className(): string { return TargetNode.name; }
    public /*override*/ isA(className: string): boolean { return className == TargetNode.name || super.isA(className); }

    //==================================================
    // IMPLEMETATION of IVisibilityContext
    //==================================================

    public canShowView(node: BaseNode): boolean
    {
        return ViewFactory.instance.canCreate(this, this.className);
    }

    public isVisibleView(node: BaseNode): boolean
    {
        const view = node.views.getViewByTarget(this);
        if (!view)
            return false;

        return view.isVisible;
    }

    public showView(node: BaseNode): boolean
    {
        let view = node.views.getViewByTarget(this);
        if (!view)
        {
            view = this.createViewCore(node);
            if (!view)
                return false;

            view.attach(node, this);
            node.views.add(view);
            this._viewsShownHere.add(view);
            view.isVisible = true;
            view.initialize();
        }
        else if (view.stayAliveIfInvisible)
        {
            if (view.isVisible)
                return false;
            else
                view.isVisible = true;
        }
        else
            return false;

        view.onShow();
        return true;
    }

    public hideView(node: BaseNode): boolean
    {
        const view = node.views.getViewByTarget(this);
        if (!view)
            return false;

        if (view.stayAliveIfInvisible)
        {
            if (!view.isVisible)
                return false;

            view.onHide();
            view.isVisible = false;
        }
        else
        {
            this.removeViewShownHere(view)
            node.views.remove(view);
        }
        return true;
    }

    public removeViewShownHere(view: BaseView): void
    {
        if (!view.stayAliveIfInvisible || !view.isVisible)
        {
            view.onHide();
            view.isVisible = false;
        }
        view.dispose();
        this._viewsShownHere.remove(view);
        view.detach();
    }

    //==================================================
    // OVERRIDES of BaseNode
    //==================================================

    public /*override*/ removeInteractive(): void
    {
        this.removeAllViewsShownHere();
        super.removeInteractive();
    }

    //==================================================
    // INSTANCE METHODS
    //==================================================

    protected createViewCore(node: BaseNode)
    {
        return ViewFactory.instance.create(node, this.className);
    }

    public removeAllViewsShownHere(): void
    {
        for (const view of this._viewsShownHere.list)
        {
            view.onHide();
            view.isVisible = false;
            view.dispose();
            const node = view.node;
            if (node)
                node.views.remove(view);
            view.detach();
        }
        this._viewsShownHere.clear();
    }


    //==================================================
    // STATIC METHODS
    //==================================================

    static getActive(node: BaseNode): TargetNode | null
    {
        const root = node.root;
        if (!root)
            return null;

        const targetFolder = root.targetFolder;
        if (targetFolder)
            return targetFolder.getActiveDescendantByClassName(TargetNode.name) as TargetNode;

        return root.getActiveDescendantByClassName(TargetNode.name) as TargetNode;
    }
}
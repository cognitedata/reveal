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

import { BaseView } from "../Views/BaseView";
import { BaseNode } from "../Nodes/BaseNode";

export class ViewFactory
{
  //==================================================
  // INSTANCE PATTERN
  //==================================================

  private static _instance: ViewFactory | null = null;

  public static get instance(): ViewFactory
  {
    if (!ViewFactory._instance)
      ViewFactory._instance = new ViewFactory();
    return ViewFactory._instance;
  }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private products: Map<string, Product>;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  private constructor()
  {
    if (ViewFactory._instance)
      throw new Error("Error - use ViewFactory.getInstance()");
    this.products = new Map<string, Product>();
  }

  //==================================================
  // INSTANCE METHODS:
  //==================================================

  public register<T extends BaseView>(className: string, viewType: new () => T, targetId: string): void
  {
    let key = this.getKey(className, targetId);
    let func = () => { return new viewType(); };
    let product = new Product(func);
    this.products.set(key, product);
  }

  public create(node: BaseNode, targetId: string): BaseView | null
  {
    let key = this.getKeyByNode(node, targetId);
    let product = this.products.get(key);
    if (product == undefined)
      return null;

    return product.func();
  }

  public canCreate(node: BaseNode, targetId: string): boolean
  {
    let key = this.getKeyByNode(node, targetId);
    return this.products.has(key);
  }

  //==================================================
  // INSTANCE METHODS: Helpers
  //==================================================

  private getKeyByNode(node: BaseNode, targetId: string): string { return this.getKey(node.className, targetId); }
  private getKey(nodeType: string, targetId: string): string { return nodeType + "_" + targetId }
}

//==================================================
// LOCAL HELPER CLASS
//==================================================

class Product
{
  public func: Function;
  public constructor(func: Function)
  {
    this.func = func;
  }
}


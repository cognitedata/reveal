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

import { BaseNode } from "@/Core/Nodes/BaseNode";
import { BaseManipulator } from '@/Three/Commands/Manipulators/BaseManipulator';

export class ManipulatorFactory
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private products = new Map<string, Product>();

  //==================================================
  // CONSTRUCTORS
  //==================================================

  private constructor()
  {
    if (ManipulatorFactory._instance)
      throw new Error("Error - use ManipulatorFactory.instance");
  }

  //==================================================
  // STATIC METHODS: Instance pattern
  //==================================================

  private static _instance: ManipulatorFactory | null = null;

  public static get instance(): ManipulatorFactory
  {
    if (!ManipulatorFactory._instance)
      ManipulatorFactory._instance = new ManipulatorFactory();
    return ManipulatorFactory._instance;
  }

  //==================================================
  // INSTANCE METHODS:
  //==================================================

  public register<T extends BaseManipulator>(className: string, manipulatorType: new () => T, targetClassName: string): void
  {
    const key = this.getKey(className, targetClassName);
    const func = () => new manipulatorType();
    const product = new Product(func);
    this.products.set(key, product);
  }

  public create(node: BaseNode, targetClassName: string): BaseManipulator | null
  {
    const key = this.getKeyByNode(node, targetClassName);
    const product = this.products.get(key);
    if (product === undefined)
      return null;

    return product.func();
  }

  public canCreate(node: BaseNode, targetClassName: string): boolean
  {
    const key = this.getKeyByNode(node, targetClassName);
    return this.products.has(key);
  }

  //==================================================
  // INSTANCE METHODS: Helpers
  //==================================================

  private getKeyByNode(node: BaseNode, targetClassName: string): string { return this.getKey(node.className, targetClassName); }
  private getKey(nodeType: string, targetClassName: string): string { return `${nodeType}.${targetClassName}`; }
}

//==================================================
// LOCAL HELPER CLASS
//==================================================

class Product
{
  public func: () => BaseManipulator;

  public constructor(func: () => BaseManipulator)
  {
    this.func = func;
  }
}

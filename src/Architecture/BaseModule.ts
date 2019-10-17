
export class BaseModule
{
  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public Install(): void
  {
    this.RegisterViewsCore();
  }

  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  protected RegisterViewsCore(): void { }
}



export class BaseModule
{
  public Install(): void
  {
    this.RegisterViewsCore();
  }

  protected RegisterViewsCore(): void { }
}


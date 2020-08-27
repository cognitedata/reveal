declare module "*.png" 
{
  const content: string;
  export default content;
}

declare module "*.svg" {}

declare module "*.scss" 
{
  const content: {[className: string]: string};
  export default content;
}

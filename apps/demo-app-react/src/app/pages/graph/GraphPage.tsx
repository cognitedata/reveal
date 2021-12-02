import reactifyWc from 'reactify-wc';
export const CogGraph: any = reactifyWc('cog-graph');

export const GraphPage = () => {
  const renderNodeAsDiv = (item: any) => {
    const el = document.createElement('div');
    el.id = item.id;
    el.title = item.title;
    el.classList.add('test-node');
    el.innerHTML = item.title;
    console.log(item);
    return el;
  };

  return <CogGraph options={{ renderNode: renderNodeAsDiv }} />;
};

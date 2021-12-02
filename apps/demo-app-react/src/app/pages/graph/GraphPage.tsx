import reactifyWc from 'reactify-wc';
import '@cognite/graph';
import { enableGraphElement } from '@cognite/graph';
export const CogGraph: any = reactifyWc('cog-graph');

enableGraphElement();

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

  return (
    <div>
      <CogGraph options={{ renderNode: renderNodeAsDiv }} />
    </div>
  );
};

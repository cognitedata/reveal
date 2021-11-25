const scrollFactor = 0.1;
const scaleFactor = 0.15;
const minZoom = 0.3;
const maxZoom = 100;
let zoomLevel = 1;

interface GetNewScrollXYProps {
  oldScrollWidth: number;
  oldScrollHeight: number;
  newScrollWidth: number;
  newScrollHeight: number;
  oldScrollX: number;
  oldScrollY: number;
  clientWidth: number;
  clientHeight: number;
}

const getNewScrollXY = ({
  oldScrollWidth,
  oldScrollHeight,
  newScrollWidth,
  newScrollHeight,
  oldScrollX,
  oldScrollY,
  clientWidth,
  clientHeight,
}: GetNewScrollXYProps) => {
  const halfClientWidth = clientWidth / 2;
  const halfClientHeight = clientHeight / 2;

  const oldCenterX = oldScrollX + halfClientWidth;
  const oldCenterY = oldScrollY + halfClientHeight;

  const newCenterX = (oldCenterX / oldScrollWidth) * newScrollWidth;
  const newCenterY = (oldCenterY / oldScrollHeight) * newScrollHeight;

  const newX = newCenterX - halfClientWidth;
  const newY = newCenterY - halfClientHeight;

  return [newX, newY];
};

export const keyboardNavigation = () => {
  let viewport: HTMLDivElement | null;
  const keyMap: { [key: string]: boolean } = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  const setZoom = (absoluteZoom: number) => {
    if (viewport === null) {
      return;
    }

    const div = viewport.querySelector('div:first-child') as HTMLElement;
    if (!div) {
      return;
    }

    zoomLevel = Math.min(Math.max(absoluteZoom, minZoom), maxZoom);

    const oldScrollWidth = viewport.scrollWidth;
    const oldScrollHeight = viewport.scrollHeight;

    if (zoomLevel < 1) {
      div.style.transformOrigin = 'center';
      div.style.transform = `scale(${zoomLevel})`;
    } else {
      div.style.transformOrigin = 'top left';
      div.style.transform = `scale(${zoomLevel})`;
    }

    const [newX, newY] = getNewScrollXY({
      oldScrollWidth,
      oldScrollHeight,
      newScrollWidth: viewport.scrollWidth,
      newScrollHeight: viewport.scrollHeight,
      oldScrollX: viewport.scrollLeft,
      oldScrollY: viewport.scrollTop,
      clientWidth: viewport.clientWidth,
      clientHeight: viewport.clientHeight,
    });

    viewport.scroll(newX, newY);
  };

  const zoomIn = () => {
    setZoom(zoomLevel * (1 + scaleFactor));
  };

  const zoomOut = () => {
    setZoom(zoomLevel / (1 + scaleFactor));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const scroll = () => {
    if (viewport === null) {
      return;
    }
    let x = viewport.scrollLeft || 0;
    let y = viewport.scrollTop || 0;
    const { clientHeight, clientWidth } = viewport;
    Object.keys(keyMap)
      .filter((key) => keyMap[key])
      .forEach((key) => {
        switch (key) {
          case 'w':
            y -= scrollFactor * clientHeight;
            break;
          case 's':
            y += scrollFactor * clientHeight;
            break;
          case 'a':
            x -= scrollFactor * clientWidth;
            break;
          case 'd':
            x += scrollFactor * clientWidth;
            break;
        }
      });
    viewport.scroll(x, y);
  };

  const navigationDownHandler = (event: KeyboardEvent): void => {
    if (document.activeElement !== document.body) {
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    switch (event.code) {
      case 'KeyW':
        keyMap.w = true;
        scroll();
        break;
      case 'KeyS':
        keyMap.s = true;
        scroll();
        break;
      case 'KeyA':
        keyMap.a = true;
        scroll();
        break;
      case 'KeyD':
        keyMap.d = true;
        scroll();
        break;
      case 'KeyQ':
        zoomOut();
        break;
      case 'KeyE':
        zoomIn();
        break;
      case 'KeyR':
        resetZoom();
        break;
    }
  };

  const navigationUpHandler = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        keyMap.w = false;
        break;
      case 'KeyS':
        keyMap.s = false;
        break;
      case 'KeyA':
        keyMap.a = false;
        break;
      case 'KeyD':
        keyMap.d = false;
        break;
    }
  };

  const initNavigationEvents = (el: HTMLDivElement) => {
    viewport = el;
    document.addEventListener('keydown', navigationDownHandler);
    document.addEventListener('keyup', navigationUpHandler);
  };

  const removeNavigationEvents = () => {
    viewport = null;
    document.removeEventListener('keydown', navigationDownHandler);
    document.removeEventListener('keyup', navigationUpHandler);
  };

  return {
    initNavigationEvents,
    removeNavigationEvents,
    zoomIn,
    zoomOut,
    resetZoom,
  };
};

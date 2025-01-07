import { settings, type ZoomModes } from '$lib/settings';
import panzoom from 'panzoom';
import type { PanZoom } from 'panzoom';
import { get, writable } from 'svelte/store';

let pz: PanZoom | undefined;
let container: HTMLElement | undefined;
const defaultMinZoom = Math.pow(0.8, 10);

export const panzoomStore = writable<PanZoom | undefined>(undefined);

export function initPanzoom(node: HTMLElement) {
  container = node;
  pz = panzoom(node, {
    bounds: false,
    maxZoom: Math.pow(1.25, 10), //Adjusted to exponents of zoom in/out
    minZoom: defaultMinZoom,
    zoomDoubleClickSpeed: 1,
    enableTextSelection: true,
    beforeMouseDown: (e) => {
      const nodeName = (e.target as HTMLElement).nodeName;
      const mousePanDisabled = get(settings).disableMousePan;
      return nodeName === 'P' || mousePanDisabled;
    },
    beforeWheel: (e) => {
      if (!e.ctrlKey) {
          const pzStore = get(panzoomStore);
          pzStore?.moveBy(0, -e.deltaY, false);

          return true;
      }
      return false;
    },
    onTouch: (e) => e.touches.length > 1,
    // Panzoom typing is wrong here
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    filterKey: (e: any) => {
      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        return true;
      }
    }
  });

  panzoomStore.set(pz);


  pz.on('pan', () => keepInBounds())
  pz.on('zoom', () => keepInBounds())
}

type PanX = 'left' | 'center' | 'right';
type PanY = 'top' | 'center' | 'bottom';

export function panAlign(alignX: PanX, alignY: PanY) {
  if (!pz || !container) {
    return;
  }

  const { scale } = pz.getTransform();
  const { innerWidth, innerHeight } = window;
  const { offsetWidth, offsetHeight } = container;

  let x = 0;
  let y = 0;

  switch (alignX) {
    case 'left':
      x = 0;
      break;
    case 'center':
      x = (innerWidth - offsetWidth * scale) / 2;
      break;
    case 'right':
      x = innerWidth - offsetWidth * scale;
      break;
  }

  switch (alignY) {
    case 'top':
      y = 0;
      break;
    case 'center':
      y = (innerHeight - offsetHeight * scale) / 2;
      break;
    case 'bottom':
      y = innerHeight - offsetHeight * scale;
      break;
  }

  pz.pause();
  pz.moveTo(x, y);
  pz.resume();
}

export function zoomOriginal() {
  pz?.moveTo(0, 0);
  pz?.zoomTo(0, 0, 1 / pz.getTransform().scale);
  panAlign('center', 'top');
  setDMinZoom(1);
}

export function zoomFitToWidth() {
  if (!pz || !container) {
    return;
  }
  const { innerWidth } = window;

  const scale = (1 / pz.getTransform().scale) * (innerWidth / container.offsetWidth);

  pz.moveTo(0, 0);
  pz.zoomTo(0, 0, scale);
  panAlign('center', 'top');
  setDMinZoom(pz.getTransform().scale);
}

export function zoomFitToHeight() {
  if (!pz || !container) {
    return;
  }
  const { innerWidth } = window;
  //var customHeight = 1600;
  var customHeight = get(settings).heightSize;
  const scaleY = (1 / pz.getTransform().scale) * (customHeight / container.offsetHeight);
  const scaleX = (1 / pz.getTransform().scale) * (innerWidth / container.offsetWidth);

  pz.moveTo(0, 0);
  if (container.offsetWidth*(customHeight / container.offsetHeight) > innerWidth) {
    pz.zoomTo(0, 0, scaleX);
    setDMinZoom(pz.getTransform().scale);
  } else {
    pz.zoomTo(0, 0, scaleY);
    setDMinZoom(pz.getTransform().scale);
  }
  panAlign('center', 'top');
}


export function zoomFitToScreen() {
  if (!pz || !container) {
    return;
  }
  const { innerWidth, innerHeight } = window;
  const scaleX = innerWidth / container.offsetWidth;
  const scaleY = innerHeight / container.offsetHeight;
  const scale = (1 / pz.getTransform().scale) * Math.min(scaleX, scaleY);
  pz.moveTo(0, 0);
  pz.zoomTo(0, 0, scale);
  setDMinZoom(pz.getTransform().scale);
  panAlign('center', 'center');
}

export function keepZoomStart() {
  panAlign('center', 'top');
  setDMinZoom(defaultMinZoom);
}

export function zoomDefault() {
  const zoomDefault = get(settings).zoomDefault;
  switch (zoomDefault) {
    case 'zoomFitToScreen':
      setDMinZoom(defaultMinZoom);
      zoomFitToScreen();
      return;
    case 'zoomFitToWidth':
      setDMinZoom(defaultMinZoom);
      zoomFitToWidth();
      return;
    case 'zoomFitToHeight':
      setDMinZoom(defaultMinZoom);
      zoomFitToHeight();
      return;
    case 'zoomOriginal':
      setDMinZoom(defaultMinZoom);
      zoomOriginal();
      return;
    case 'keepZoomStart':
      setDMinZoom(defaultMinZoom);
      keepZoomStart();
      return;
  }
}
//Function to handle updating min zoom
export function setDMinZoom(inScale: number){
  pz?.setMinZoom(inScale);
  panzoomStore.set(pz);
  return;
}

export function keepInBounds() {
  if (!pz || !container) {
    return
  }

  const { mobile, bounds } = get(settings)

  if (!mobile && !bounds) {
    return
  }

  const transform = pz.getTransform();

  const { x, y, scale } = transform;
  const { innerWidth, innerHeight } = window

  const width = container.offsetWidth * scale;
  const height = container.offsetHeight * scale;

  const marginX = innerWidth * 0.001;
  const marginY = innerHeight * 0.01;

  let minX = innerWidth - width - marginX;
  let maxX = marginX;
  let minY = innerHeight - height - marginY;
  let maxY = marginY;

  let forceCenterY = false;

  if (width + 2 * marginX <= innerWidth) {
    minX = marginX;
    maxX = innerWidth - width - marginX;
  } else {
    minX = innerWidth - width - marginX;
    maxX = marginX;
  }

  if (height + 2 * marginY <= innerHeight) {
    minY = marginY;
    maxY = innerHeight - height - marginY;
    forceCenterY = true;
  } else {
    minY = innerHeight - height - marginY;
    maxY = marginY;
  }

  if (x < minX) {
    transform.x = minX;
  }
  if (x > maxX) {
    transform.x = maxX;
  }

  if (forceCenterY) {
    transform.y = innerHeight / 2 - height / 2;
  } else {
    if (y < minY) {
      transform.y = minY;
    }
    if (y > maxY) {
      transform.y = maxY;
    }
  }
}

export function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}
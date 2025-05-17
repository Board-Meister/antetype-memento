import type { IBaseDef, InitEvent, ISettings, Layout } from "@boardmeister/antetype-core";
import { Event as CoreEvent } from "@boardmeister/antetype-core";
import type { Herald } from "@boardmeister/herald";

export const generateRandomConditionLayer = (
  type: string,
  x: number|null = null,
  y: number|null = null,
  w: number|null = null,
  h: number|null = null,
): IBaseDef => {
  const layer: IBaseDef = {
    type,
    start: { x: x ?? Math.random(), y: y ?? Math.random() },
    size: { w: w ?? Math.random(), h: h ?? Math.random() },
    _mark: Math.random(),
  };

  layer.area = {
    start: Object.assign({}, layer.start),
    size: Object.assign({}, layer.size),
  }

  return layer;
};

export const initialize = (herald: Herald, layout: Layout|null = null, settings: ISettings = {}): Promise<void> => {
  return herald.dispatch(new CustomEvent<InitEvent>(CoreEvent.INIT, {
    detail: {
      base: layout ?? [
        generateRandomConditionLayer('clear1'),
        generateRandomConditionLayer('clear2'),
        generateRandomConditionLayer('clear3'),
        generateRandomConditionLayer('clear4'),
      ],
      settings,
    }
  }));
}

export const close = (herald: Herald): Promise<void> => {
  return herald.dispatch(new CustomEvent<CloseEvent>(CoreEvent.CLOSE));
}

export const awaitEvent = (herald: Herald, event: string, timeout = 100): Promise<void> => {
  return new Promise(resolve => {
    const timeoutId = setTimeout(() => {
      unregister();
      resolve();
    }, timeout);

    const unregister = herald.register(event, () => {
      unregister();
      resolve();
      clearTimeout(timeoutId);
    });
  });
}
import type { ICore } from "@boardmeister/antetype-core";
import { Core } from "@boardmeister/antetype-core";
import { Herald } from "@boardmeister/herald";
import Memento from "@src/module";
import { type IMemento } from "@src/module";
import {
  initialize, close, generateRandomConditionLayer,
} from "test/helpers/definition.helper";

describe('Memento is', () => {
  let memento: IMemento, core: ICore;
  const herald = new Herald();
  const canvas = document.createElement('canvas');
  beforeEach(() => {
    core = Core({ herald, canvas }) as ICore;
    memento = Memento({ canvas, modules: { core }, herald });
  });

  afterEach(async () => {
    await close(herald);
  })

  it('undoing and redoing properly', async () => {
    await initialize(herald, [
      generateRandomConditionLayer('testMemento'),
    ]);
    const layer = core.meta.document.base[0];
    let redoDone = 0,
      undoDone = 0;
    memento.addToStack([
      {
        origin: "testing",
        data: ["test"],
        layer,
        undo: (origin, data) => {
          undoDone = 1;
          expect(origin).toBe(layer);
          expect(data).toEqual(jasmine.objectContaining(['test']));
        },
        redo: (origin, data) => {
          redoDone = 1;
          expect(origin).toBe(layer);
          expect(data).toEqual(jasmine.objectContaining(['test']));
        }
      }
    ]);

    await memento.undo();
    await memento.redo();
    expect(redoDone).toBe(1);
    expect(undoDone).toBe(1);
  });

  it('undoing and redoing on key up event', async () => {
    await initialize(herald, [
      generateRandomConditionLayer('testMemento'),
    ]);
    const layer = core.meta.document.base[0];
    let redoDone = 0,
      undoDone = 0;
    memento.addToStack([
      {
        origin: "testing",
        data: ["test"],
        layer,
        undo: (origin, data) => {
          undoDone = 1;
          expect(origin).toBe(layer);
          expect(data).toEqual(jasmine.objectContaining(['test']));
        },
        redo: (origin, data) => {
          redoDone = 1;
          expect(origin).toBe(layer);
          expect(data).toEqual(jasmine.objectContaining(['test']));
        }
      }
    ]);

    canvas.dispatchEvent(new KeyboardEvent('keyup', {
      ctrlKey: true,
      key: 'z',
    }));
    await new Promise(r => setTimeout(r, 0));
    expect(undoDone).toBe(1);

    canvas.dispatchEvent(new KeyboardEvent('keyup', {
      ctrlKey: true,
      key: 'y',
    }));
    await new Promise(r => setTimeout(r, 0));
    expect(redoDone).toBe(1);
  });
});
import { type IBaseDef, type IParentDef, Event as CoreEvent } from "@boardmeister/antetype-core"
import { Event, IMementoParams, IMementoState, type SaveEvent } from "@src/index";

export interface IMemento {
  addToStack: (state: IMementoState[]) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

export interface IStackItem {
  instance: IMementoState;
  original: IBaseDef|IParentDef;
}

export default function Memento(
  {
    herald,
    modules,
    canvas,
  }: IMementoParams
): IMemento {
  const undoStack: IStackItem[][] = [];
  let redoStack: IStackItem[][] = [];
  const maxItems = 100;

  const onKeyUp = (e: KeyboardEvent): void => {
    if (!e.ctrlKey) {
      return;
    }

    if (e.key === 'z') {
      void undo();
      return;
    }

    if (e.key === 'y') {
      void redo();
      return;
    }
  }

  const generateStackItems = (state: IMementoState[]): IStackItem[] => {
    const items: IStackItem[] = [];
    state.forEach(instance => {
      items.push({
        instance,
        original: modules.core.clone.getOriginal(instance.layer),
      })
    })

    return items;
  }

  const addToStack = (state: IMementoState[]): void => {
    undoStack.push(generateStackItems(state));
    redoStack = [];
    if (undoStack.length > maxItems) {
      undoStack.shift();
    }
  }

  const undo = async (): Promise<void> => {
    if (undoStack.length === 0) {
      return;
    }
    const toUndo = undoStack.splice(-1)[0];
    redoStack.push(toUndo);
    // Recalculating before undoing to allow adding violate layers to the drawing
    await modules.core.view.recalculate();
    for (const state of toUndo) {
      await state.instance.undo(state.original, state.instance.data ?? undefined);
    }

    modules.core.view.redraw();
  }

  const redo = async (): Promise<void> => {
    if (redoStack.length === 0) {
      return;
    }
    const toRedo = redoStack.splice(-1)[0];
    undoStack.push(toRedo);
    // Recalculating before redoing to allow adding violate layers to the drawing
    await modules.core.view.recalculate();
    for (const state of toRedo) {
      await state.instance.redo(state.original, state.instance.data ?? undefined);
    }

    modules.core.view.redraw();
  }

  canvas?.addEventListener('keyup', onKeyUp, false);
  const unregister = herald.batch([
    {
      event: Event.SAVE,
      subscription: (event: CustomEvent<SaveEvent>): void => {
        addToStack(event.detail.state);
      },
    },
    {
      event: CoreEvent.CLOSE,
      subscription: () => {
        canvas?.removeEventListener('keyup', onKeyUp, false);
        unregister();
      },
    },
  ]);

  return {
    addToStack,
    undo,
    redo,
  };
}

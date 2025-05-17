import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Minstrel } from "@boardmeister/minstrel"
import type { Herald, ISubscriber, Subscriptions } from "@boardmeister/herald"
import type Memento from "@src/module";
import type { ICore, IBaseDef, IParentDef, ModulesEvent, Modules } from "@boardmeister/antetype-core"
import { Event as AntetypeEvent } from "@boardmeister/antetype-core"

export type SaveCommand<T = unknown> = (original: IBaseDef|IParentDef, data: T) => void|Promise<void>;

export interface IRequiredModules extends Modules {
  core: ICore;
}

export enum Event {
  SAVE = 'antetype.memento.save',
}

export interface IMementoState<T = unknown> {
  origin?: string;
  data?: T;
  layer: IBaseDef;
  undo: SaveCommand<T>;
  redo: SaveCommand<T>;
}

export interface SaveEvent<T = unknown> {
  state: IMementoState<T>[];
}

export interface IMementoParams {
  canvas: HTMLCanvasElement|null,
  modules: IRequiredModules,
  herald: Herald,
}

interface IInjected extends Record<string, object> {
  minstrel: Minstrel;
  herald: Herald;
}

export class Skeleton {
  #injected?: IInjected;
  #module: typeof Memento|null = null;

  static inject: Record<string, string> = {
    minstrel: 'boardmeister/minstrel',
    herald: 'boardmeister/herald',
  }
  inject(injections: IInjected): void {
    this.#injected = injections;
  }

  async register(event: CustomEvent<ModulesEvent>): Promise<void> {
    const { modules, canvas } = event.detail;
    if (!this.#module) {
      const module = this.#injected!.minstrel.getResourceUrl(this as Module, 'module.js');
      this.#module = ((await import(module)) as { default: typeof Memento }).default;
    }
    modules.memento = this.#module({
      canvas,
      modules: modules as IRequiredModules,
      herald: this.#injected!.herald,
    });
  }

  static subscriptions: Subscriptions = {
    [AntetypeEvent.MODULES]: 'register',
  }
}
const EnSkeleton: IInjectable<IInjected>&ISubscriber = Skeleton
export default EnSkeleton;

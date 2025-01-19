import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Minstrel } from "@boardmeister/minstrel"
import type { Herald, ISubscriber, Subscriptions } from "@boardmeister/herald"
import type Memento from "@src/module";
import type { IMemento } from "@src/module";
import type { ModulesEvent, Modules } from "@boardmeister/antetype"
import type { ICore, IBaseDef } from "@boardmeister/antetype-core"
import { Event as AntetypeEvent } from "@boardmeister/antetype"

export type SaveCommand<T = unknown> = (original: IBaseDef, data: T) => void|Promise<void>;

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
  injected: IInjected,
}

interface IInjected extends Record<string, object> {
  minstrel: Minstrel;
  herald: Herald;
}

export class Skeleton {
  #injected?: IInjected;
  #module: typeof Memento|null = null;
  #instance: IMemento|null = null;

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
    this.#instance = modules.transform = this.#module({
      canvas,
      modules: modules as IRequiredModules,
      injected: this.#injected!
    });
  }

  save(event: CustomEvent<SaveEvent>): void {
    if (!this.#instance) {
      return;
    }
    this.#instance.addToStack(event.detail.state);
  }

  static subscriptions: Subscriptions = {
    [AntetypeEvent.MODULES]: 'register',
    [Event.SAVE]: 'save',
  }
}
const EnSkeleton: IInjectable&ISubscriber = Skeleton
export default EnSkeleton;

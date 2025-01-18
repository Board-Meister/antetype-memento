import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Minstrel } from "@boardmeister/minstrel"
import type { Herald, ISubscriber, Subscriptions } from "@boardmeister/herald"
import type Memento from "@src/module";
import type { IMemento } from "@src/module";
import type { ModulesEvent, Modules } from "@boardmeister/antetype"
import type { ICore } from "@boardmeister/antetype-core"
import { Event as AntetypeEvent } from "@boardmeister/antetype"

export interface IRequiredModules extends Modules {
  core: ICore;
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
  // @ts-expect-error TS6133: '#instance' is declared but its value is never read.
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

  static subscriptions: Subscriptions = {
    [AntetypeEvent.MODULES]: 'register',
  }
}
const EnSkeleton: IInjectable&ISubscriber = Skeleton
export default EnSkeleton;

import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Herald, ISubscriber, Subscriptions } from "@boardmeister/herald"
import type Memento from "@src/module";
import type { ModulesEvent } from "@boardmeister/antetype-core"
import { Event as AntetypeEvent } from "@boardmeister/antetype-core"
import type { IRequiredModules } from "@src/type.d";
import type Marshal from "@boardmeister/marshal";

interface IInjected extends Record<string, object> {
  marshal: Marshal;
  herald: Herald;
}

export class MementoConf {
  #injected?: IInjected;
  #module: typeof Memento|null = null;

  static inject: Record<string, string> = {
    marshal: 'boardmeister/marshal',
    herald: 'boardmeister/herald',
  }
  inject(injections: IInjected): void {
    this.#injected = injections;
  }

  async register(event: CustomEvent<ModulesEvent>): Promise<void> {
    const { modules, canvas } = event.detail;
    if (!this.#module) {
      const module = this.#injected!.marshal.getResourceUrl(this as Module, 'module.js');
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
const EnMementoConf: IInjectable<IInjected>&ISubscriber = MementoConf
export default EnMementoConf;

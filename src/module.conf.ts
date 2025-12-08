import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Herald, ISubscriber, Subscriptions } from "@boardmeister/herald"
import type Memento from "@src/module";
import type { ModulesEvent } from "@boardmeister/antetype-core"
import type { IRequiredModules } from "@src/type.d";
import type Marshal from "@boardmeister/marshal";
import { Event as AntetypeEvent } from "@boardmeister/antetype-core"

export const ID = 'memento';
export const VERSION = '0.0.4';

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

  register(event: ModulesEvent): void {
    const { registration } = event.detail;

    registration[ID] = {
      load: async () => {
        if (!this.#module) {
          const module = this.#injected!.marshal.getResourceUrl(this as Module, 'module.js');
          this.#module = ((await import(module)) as { default: typeof Memento }).default;
        }

        return modules => this.#module!({
          modules: modules as IRequiredModules,
          herald: this.#injected!.herald,
        });
      },
      version: VERSION,
    };
  }

  static subscriptions: Subscriptions = {
    [AntetypeEvent.MODULES]: 'register',
  }
}
const EnMementoConf: IInjectable<IInjected>&ISubscriber = MementoConf
export default EnMementoConf;

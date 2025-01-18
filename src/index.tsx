import type { IInjectable, Module } from "@boardmeister/marshal"
import type { Minstrel } from "@boardmeister/minstrel"
import type { Herald, ISubscriber, Subscriptions } from "@boardmeister/herald"
import MyModule, { IMyModule } from "@src/myModule";

interface IInjected extends Record<string, object> {
  minstrel: Minstrel;
  herald: Herald;
}

export class Skeleton {
  #injected?: IInjected;
  #module: typeof MyModule|null = null;
  // @ts-expect-error TS6133: '#instance' is declared but its value is never read.
  #instance: IMyModule|null = null;

  static inject: Record<string, string> = {
    minstrel: 'boardmeister/minstrel',
    herald: 'boardmeister/herald',
  }
  inject(injections: IInjected): void {
    this.#injected = injections;
  }

  /**
   * Example of lazy loading the module
   */
  async register(event: CustomEvent<{ modules: Record<string, unknown> }>): Promise<void> {
    if (!this.#module) {
      const module = this.#injected!.minstrel.getResourceUrl(this as Module, 'myModule.js');
      this.#module = ((await import(module)) as { default: typeof MyModule }).default;
    }
    this.#instance = event.detail.modules.myModule = this.#module();
  }

  static subscriptions: Subscriptions = {
    'example.module.register': 'register',
  }
}
const EnSkeleton: IInjectable&ISubscriber = Skeleton
export default EnSkeleton;

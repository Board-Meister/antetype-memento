import type { ICore, IBaseDef, IParentDef, Modules } from "@boardmeister/antetype-core"

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
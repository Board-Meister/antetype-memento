import {IMementoParams} from "@src/index";

export interface IMemento {}

export default function Memento(
  params: IMementoParams
): IMemento {
  console.log(params)
  return {};
}

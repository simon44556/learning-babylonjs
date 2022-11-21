import { Subject } from "./Subject";

export interface Observer {
  observerUpdate(subject: Subject): void;
}

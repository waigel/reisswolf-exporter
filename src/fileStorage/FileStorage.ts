import { ReisswolfDocument } from "../types/Document";

export interface FileStorage {
  uploadFile: (document: ReisswolfDocument) => Promise<string | void>;
}

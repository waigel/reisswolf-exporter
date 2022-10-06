import moment from "moment";
import { ReisswolfDocument } from "../types/Document";

const TEMP_DOCUMENT_DOWNLOADFOLDER = "/tmp";

export const buildTempFileName = (document: ReisswolfDocument) =>
  `${TEMP_DOCUMENT_DOWNLOADFOLDER}/${document.uuid}.${document.contentTypeExtension}`;

export const buildRemoteFileName = (document: ReisswolfDocument) =>
  `documents/${moment().format("YYYY")}/${moment().format(
    "MM"
  )}/${moment().format("DD")}/${document.uuid}.${
    document.contentTypeExtension
  }`;

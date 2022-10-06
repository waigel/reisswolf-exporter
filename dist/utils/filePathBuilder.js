"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRemoteFileName = exports.buildTempFileName = void 0;
const moment_1 = __importDefault(require("moment"));
const TEMP_DOCUMENT_DOWNLOADFOLDER = "/tmp";
const buildTempFileName = (document) => `${TEMP_DOCUMENT_DOWNLOADFOLDER}/${document.uuid}.${document.contentTypeExtension}`;
exports.buildTempFileName = buildTempFileName;
const buildRemoteFileName = (document) => `documents/${(0, moment_1.default)().format("YYYY")}/${(0, moment_1.default)().format("MM")}/${(0, moment_1.default)().format("DD")}/${document.uuid}.${document.contentTypeExtension}`;
exports.buildRemoteFileName = buildRemoteFileName;

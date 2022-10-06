"use strict";
//https://p2682.reisswolf.fit/postbox/query?filter=All&parentPath=null&offset=0&max=25&cache=false
//https://p2682.reisswolf.fit/login/authenticate
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3_1 = require("./fileStorage/s3");
const client_1 = require("./reisswolf/client");
const webhook_1 = require("./webhooks/webhook");
require("dotenv").config();
const client = (0, client_1.createReisswolfClient)();
const s3FileStorage = (0, s3_1.createS3FileStorage)();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield client.fetchInitialCookie();
    yield client.login();
    yield client.configureTimezone();
    yield client.getCSRFTOKEN();
    const documents = yield client.fetchPoxbox();
    documents.forEach((document) => __awaiter(void 0, void 0, void 0, function* () {
        const props = document.props;
        const read = props.find((prop) => prop.name === "postbox:isRead");
        if ((read === null || read === void 0 ? void 0 : read.value) === false) {
            console.log(`Process document ${document.uuid}`);
            yield client.downloadDocument(document);
            const locationUrl = yield s3FileStorage.uploadFile(document);
            console.log("locationUrl", locationUrl);
            yield (0, webhook_1.sendWebhook)(document, locationUrl);
            yield client.readDocument(document, true);
            console.log(`Document ${document.uuid} marked as read`);
        }
    }));
}))();

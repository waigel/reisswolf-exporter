"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWebhook = void 0;
const moment_1 = __importDefault(require("moment"));
const webhook_discord_1 = require("webhook-discord");
const thumbnailUrls = [
    "https://media1.giphy.com/media/RIH4LfsbEiLlu/200.gif",
    "https://media1.giphy.com/media/ubb8wK4rHQtKem9P3I/giphy.gif",
    "https://media.tenor.com/PTCRHBaTtJsAAAAM/amazon-delivery.gif",
    "https://c.tenor.com/PLddH-RShaYAAAAM/special-delivery-delivery.gif",
];
const sendWebhook = (document, locationUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { DISCORD_WEBHOOK_URL, COMPANY_DISPLAY_NAME } = process.env;
    const webhook = new webhook_discord_1.Webhook(DISCORD_WEBHOOK_URL !== null && DISCORD_WEBHOOK_URL !== void 0 ? DISCORD_WEBHOOK_URL : "");
    const message = new webhook_discord_1.MessageBuilder()
        .setName("Reisswolf")
        .setThumbnail(thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)])
        .setTitle(":postal_horn: Die Post war da! :postal_horn: ")
        .setDescription(`Hurra, die Post ist da! Neuer Brief für ${COMPANY_DISPLAY_NAME} eingetroffen.`)
        .addField("Erstellt am", (0, moment_1.default)(document.dateCreated).format("DD.MM.YYYY HH:mm"), true)
        .addField("Letzte Änderung", (0, moment_1.default)(document.lastUpdated).format("DD.MM.YYYY HH:mm"), true)
        .addField("Erstellt von", document.createdBy, true)
        .addField("Name", document.name, true)
        //Größe in MB
        .addField("Größe", `${(document.contentLength / 1024 / 1024).toFixed(2)} MB`, true)
        .addField("Seiten", (_b = (_a = document.props.find((x) => x.name === "postbox:pages")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "N/A", true)
        .addField("Tags", document.tags.join(", "), true)
        .addField("Link (VPN)", locationUrl !== null && locationUrl !== void 0 ? locationUrl : document.contentUrl)
        .setColor("#f9d71c")
        .setTime();
    webhook.send(message).catch(console.error);
});
exports.sendWebhook = sendWebhook;

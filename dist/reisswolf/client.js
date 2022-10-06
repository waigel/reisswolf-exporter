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
exports.createReisswolfClient = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const stream_1 = __importDefault(require("stream"));
const util_1 = require("util");
const filePathBuilder_1 = require("../utils/filePathBuilder");
const finished = (0, util_1.promisify)(stream_1.default.finished);
const createReisswolfClient = () => {
    const { RESSWOLF_INSTANCE, RESSWOLF_USERNAME, RESSWOLF_PASSWORD } = process.env;
    const instance = axios_1.default.create({
        baseURL: `https://${RESSWOLF_INSTANCE}.reisswolf.fit`,
        headers: {
            withCredentials: true,
            Accept: "*/*",
            "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            Connection: "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
        },
    });
    const setAuthCookie = (headers) => {
        if (!headers) {
            return;
        }
        const authCookie = headers["set-cookie"]
            ? headers["set-cookie"]
            : undefined;
        if (authCookie) {
            console.log("authCookie", authCookie.toString().split(";")[0]);
            instance.defaults.headers.Cookie = authCookie.toString().split(";")[0];
        }
        else {
            console.error("Authentication failed, no cookie received");
            return;
        }
    };
    const fetchInitialCookie = () => __awaiter(void 0, void 0, void 0, function* () {
        yield instance.get("/login/auth").then(({ headers }) => {
            setAuthCookie(headers);
        });
    });
    const login = () => __awaiter(void 0, void 0, void 0, function* () {
        yield instance
            .post("/login/authenticate", `username=${RESSWOLF_USERNAME}&password=${RESSWOLF_PASSWORD}`, {
            maxRedirects: 0,
            headers: {
                "Content-Type": `application/x-www-form-urlencoded`,
            },
        })
            .then(({ headers, data, status }) => {
            throw new Error("Login failed, status code: " + status);
        })
            .catch(({ response }) => {
            if ((response === null || response === void 0 ? void 0 : response.status) !== 302) {
                throw new Error("Authentication failed, status code 302 expected, actual status code: " +
                    (response === null || response === void 0 ? void 0 : response.status));
            }
            setAuthCookie(response === null || response === void 0 ? void 0 : response.headers);
        });
    });
    const configureTimezone = () => __awaiter(void 0, void 0, void 0, function* () {
        yield instance
            .get("/timezone/setZone", {
            params: {
                zone: "Europe/Berlin",
            },
        })
            .then(({ status }) => console.log("Configured timeZone: ", status === 200 ? "OK" : "ERROR"))
            .catch(console.error);
    });
    const fetchPoxbox = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield instance
            .get("/postbox/query", {
            params: {
                filter: "Today",
            },
        })
            .then(({ data }) => data);
    });
    const getCSRFTOKEN = () => __awaiter(void 0, void 0, void 0, function* () {
        return yield instance.get("postbox/filter/All").then(({ data }) => {
            //  <meta name="_csrf" content="xxxxx"/>
            const csrfToken = data.match(/<meta name="_csrf" content="(.*)"/);
            //<meta name="_csrf_header" content="X-CSRF-TOKEN"/>
            const csrfHeader = data.match(/<meta name="_csrf_header" content="(.*)"/);
            if (csrfToken && csrfHeader) {
                instance.defaults.headers[csrfHeader[1]] = csrfToken[1];
                return { csrfToken: csrfToken[1], csrfHeader: csrfHeader[1] };
            }
            throw new Error("No CSRF token found");
        });
    });
    const readDocument = (document, isRead) => __awaiter(void 0, void 0, void 0, function* () {
        yield instance
            .post(`postbox/setRead/${document.uuid}`, `isRead=${isRead}`, {
            maxRedirects: 0,
            headers: {
                "Content-Type": `application/x-www-form-urlencoded`,
            },
        })
            .then(({ data }) => {
            console.log(data);
        })
            .catch(console.error);
    });
    const downloadDocument = (document) => __awaiter(void 0, void 0, void 0, function* () {
        const writer = (0, fs_1.createWriteStream)((0, filePathBuilder_1.buildTempFileName)(document));
        yield instance
            .get(`/content/${document.uuid}`, {
            responseType: "stream",
        })
            .then(({ data }) => {
            data.pipe(writer);
            return finished(writer);
        })
            .catch(console.error);
    });
    return {
        fetchInitialCookie,
        login,
        configureTimezone,
        downloadDocument,
        readDocument,
        getCSRFTOKEN,
        fetchPoxbox,
    };
};
exports.createReisswolfClient = createReisswolfClient;

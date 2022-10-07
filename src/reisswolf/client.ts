import axios, { AxiosError, AxiosResponseHeaders } from "axios";
import { createWriteStream } from "fs";
import stream from "stream";
import { promisify } from "util";
import { ReisswolfDocument } from "../types/Document";
import { buildTempFileName } from "../utils/filePathBuilder";
const finished = promisify(stream.finished);

export const createReisswolfClient = () => {
  const { RESSWOLF_INSTANCE, RESSWOLF_USERNAME, RESSWOLF_PASSWORD } =
    process.env;

  const instance = axios.create({
    baseURL: `https://${RESSWOLF_INSTANCE}.reisswolf.fit`,
    headers: {
      withCredentials: true,
      Accept: "*/*",
      "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
    },
  });

  const setAuthCookie = (
    headers?: AxiosResponseHeaders | Partial<Record<string, string>>
  ) => {
    if (!headers) {
      return;
    }
    const authCookie = headers["set-cookie"]
      ? headers["set-cookie"]
      : undefined;
    if (authCookie) {
      console.log("authCookie", authCookie.toString().split(";")[0]);
      instance.defaults.headers.Cookie = authCookie.toString().split(";")[0];
    } else {
      console.error("Authentication failed, no cookie received");
      return;
    }
  };

  const fetchInitialCookie = async () => {
    await instance.get("/login/auth").then(({ headers }) => {
      setAuthCookie(headers);
    });
  };

  const login = async () => {
    await instance
      .post<string>(
        "/login/authenticate",
        `username=${RESSWOLF_USERNAME}&password=${RESSWOLF_PASSWORD}`,
        {
          maxRedirects: 0,
          headers: {
            "Content-Type": `application/x-www-form-urlencoded`,
          },
        }
      )
      .then(({ status }) => {
        throw new Error("Login failed, status code: " + status);
      })
      .catch(({ response }: AxiosError) => {
        if (response?.status !== 302) {
          throw new Error(
            "Authentication failed, status code 302 expected, actual status code: " +
              response?.status
          );
        }
        setAuthCookie(response?.headers);
      });
  };

  const configureTimezone = async () => {
    await instance
      .get("/timezone/setZone", {
        params: {
          zone: "Europe/Berlin",
        },
      })
      .then(({ status }) =>
        console.log("Configured timeZone: ", status === 200 ? "OK" : "ERROR")
      )
      .catch(console.error);
  };

  const fetchPoxbox = async (): Promise<ReisswolfDocument[]> => {
    return await instance
      .get<ReisswolfDocument[] | string>("/postbox/query", {
        params: {
          filter: "Today",
        },
      })
      .then(({ data }) => {
        if (typeof data === "string") {
          return [];
        }
        return data;
      })
      .catch((error) => {
        console.error(error);
        return [];
      });
  };

  const getCSRFTOKEN = async () => {
    return await instance.get<string>("postbox/filter/All").then(({ data }) => {
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
  };

  const readDocument = async (document: ReisswolfDocument, isRead: boolean) => {
    await instance
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
  };

  const downloadDocument = async (document: ReisswolfDocument) => {
    const writer = createWriteStream(buildTempFileName(document));
    await instance
      .get(`/content/${document.uuid}`, {
        responseType: "stream",
      })
      .then(({ data }) => {
        data.pipe(writer);
        return finished(writer);
      })
      .catch(console.error);
  };

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

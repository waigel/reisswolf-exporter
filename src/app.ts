import { createS3FileStorage } from "./fileStorage/s3";
import { createReisswolfClient } from "./reisswolf/client";
import { sendWebhook } from "./webhooks/webhook";
import { config } from "dotenv";

config();

const client = createReisswolfClient();
const s3FileStorage = createS3FileStorage();

(async () => {
  await client.fetchInitialCookie();
  await client.login();
  await client.configureTimezone();
  await client.getCSRFTOKEN();
  const documents = await client.fetchPoxbox();

  console.log("documents", documents);
  documents.forEach(async (document) => {
    const props = document.props;
    const read = props?.find((prop) => prop.name === "postbox:isRead");
    if (read?.value === false) {
      console.log(`Process document ${document.uuid}`);
      await client.downloadDocument(document);

      const locationUrl = await s3FileStorage.uploadFile(document);
      console.log("locationUrl", locationUrl);
      await sendWebhook(document, locationUrl);

      await client.readDocument(document, true);
      console.log(`Document ${document.uuid} marked as read`);
    }
  });
})();

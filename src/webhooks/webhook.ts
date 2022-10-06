import moment from "moment";
import { MessageBuilder, Webhook } from "webhook-discord";
import { ReisswolfDocument } from "../types/Document";

const thumbnailUrls = [
  "https://media1.giphy.com/media/RIH4LfsbEiLlu/200.gif",
  "https://media1.giphy.com/media/ubb8wK4rHQtKem9P3I/giphy.gif",
  "https://media.tenor.com/PTCRHBaTtJsAAAAM/amazon-delivery.gif",
  "https://c.tenor.com/PLddH-RShaYAAAAM/special-delivery-delivery.gif",
];

export const sendWebhook = async (
  document: ReisswolfDocument,
  locationUrl: string | void
) => {
  const { DISCORD_WEBHOOK_URL, COMPANY_DISPLAY_NAME } = process.env;
  const webhook = new Webhook(DISCORD_WEBHOOK_URL ?? "");
  const message = new MessageBuilder()
    .setName("Reisswolf")
    .setThumbnail(
      thumbnailUrls[Math.floor(Math.random() * thumbnailUrls.length)]
    )
    .setTitle(":postal_horn: Die Post war da! :postal_horn: ")
    .setDescription(
      `Hurra, die Post ist da! Neuer Brief für ${COMPANY_DISPLAY_NAME} eingetroffen.`
    )
    .addField(
      "Erstellt am",
      moment(document.dateCreated).format("DD.MM.YYYY HH:mm"),
      true
    )
    .addField(
      "Letzte Änderung",
      moment(document.lastUpdated).format("DD.MM.YYYY HH:mm"),
      true
    )
    .addField("Erstellt von", document.createdBy, true)
    .addField("Name", document.name, true)
    //Größe in MB
    .addField(
      "Größe",
      `${(document.contentLength / 1024 / 1024).toFixed(2)} MB`,
      true
    )
    .addField(
      "Seiten",
      document.props
        .find((x) => x.name === "postbox:pages")
        ?.value.toString() ?? "N/A",
      true
    )
    .addField("Tags", document.tags.join(", "), true)
    .addField("Link (VPN)", locationUrl ?? document.contentUrl)
    .setColor("#f9d71c")
    .setTime();

  webhook.send(message).catch(console.error);
};

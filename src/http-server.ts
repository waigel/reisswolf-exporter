import express from "express";
import { runExporter } from "./exporter";
const app = express();

app.get("/health", (_req, res) => {
  res.status(200).send({ status: "up" });
});

app.get("/scheduled-execution", async (_req, res) => {
  try {
    runExporter();
    await res.status(200).send("ok");
  } catch (e) {
    res.status(500).send(e);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

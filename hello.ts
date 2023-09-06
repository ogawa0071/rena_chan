import { Hono } from "https://deno.land/x/hono@v3.5.8/mod.ts";
import {
  Client,
  ClientConfig,
  MessageAPIResponseBase,
  WebhookEvent,
} from "npm:@line/bot-sdk@7.5.2";

// Setup all LINE client and Express configurations.
const clientConfig: ClientConfig = {
  channelAccessToken: Deno.env.get("CHANNEL_ACCESS_TOKEN") || "",
  channelSecret: Deno.env.get("CHANNEL_SECRET") || "",
};

// Create a new LINE SDK client.
const client = new Client(clientConfig);

// Create a new Express application.
const app = new Hono();

// Function handler to receive the text.
const textEventHandler = async (
  event: WebhookEvent,
): Promise<MessageAPIResponseBase | undefined> => {
  switch (event.type) {
    case "message":
      switch (event.message.type) {
        case "text":
          switch (true) {
            case event.message.text === "それな":
              return await client.replyMessage(event.replyToken, {
                type: "text",
                text: "いまのそれな言いたかったー！",
              });

            case event.message.text.endsWith("ね"):
            case event.message.text.endsWith("な"):
            case event.message.text.endsWith("ね？"):
              return await client.replyMessage(event.replyToken, {
                type: "text",
                text: "それな",
              });
          }
          break;

        case "sticker":
          switch (event.message.packageId) {
            case "1002897":
              return await client.replyMessage(event.replyToken, {
                type: "text",
                text: "ありさだー！",
              });
          }
      }
  }
};

// Route handler to receive webhook events.
// This route is used to receive connection tests.
app.get("/", (c) =>
  c.json({
    status: "success",
    message: "Connected successfully!",
  }));

// This route is used for the Webhook.
app.post("/webhook", async (c) => {
  const events: WebhookEvent[] = (await c.req.json()).events;

  console.log(events);

  // Process all of the received events asynchronously.
  const results = await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await textEventHandler(event);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
        }

        // Return an error message.
        return c.json(
          {
            status: "error",
          },
          500,
        );
      }
    }),
  );

  // Return a successfull message.
  return c.json({
    status: "success",
    results,
  });
});

Deno.serve(app.fetch);

import { env } from "cloudflare:workers";
import { Hono } from "hono";
import * as line from "@line/bot-sdk";

// Setup all LINE client and Express configurations.
const clientConfig: line.LineBotClientChannelAccessTokenConfig = {
  channelAccessToken: env.CHANNEL_ACCESS_TOKEN,
};

const middlewareConfig: line.MiddlewareConfig = {
  channelSecret: env.CHANNEL_SECRET,
};

// Create a new LINE SDK client.
const client = line.LineBotClient.fromChannelAccessToken(clientConfig);

// Create a new Express application.
const app = new Hono();

// Function handler to receive the text.
const textEventHandler = async (
  event: line.webhook.Event,
): Promise<line.MessageAPIResponseBase | undefined> => {
  switch (event.type) {
    case "message":
      if (!event.replyToken) {
        return;
      }

      switch (event.message.type) {
        case "text":
          switch (true) {
            case event.message.text === "それな":
              await client.replyMessage({
                replyToken: event.replyToken,
                messages: [
                  {
                    type: "text",
                    text: "いまのそれな言いたかったー！",
                  },
                ],
              });
              return;

            case event.message.text.endsWith("ね"):
            case event.message.text.endsWith("な"):
            case event.message.text.endsWith("ね？"):
              await client.replyMessage({
                replyToken: event.replyToken,
                messages: [
                  {
                    type: "text",
                    text: "それな",
                  },
                ],
              });
              return;
          }
          break;

        case "sticker":
          switch (event.message.packageId) {
            case "1002897":
              await client.replyMessage({
                replyToken: event.replyToken,
                messages: [
                  {
                    type: "text",
                    text: "ありさだー！",
                  },
                ],
              });
              return;
          }
      }
  }
};

// Register the LINE middleware.
// As an alternative, you could also pass the middleware in the route handler, which is what is used here.
// app.use(middleware(middlewareConfig));

// Route handler to receive webhook events.
// This route is used to receive connection tests.
app.get("/", (c) =>
  c.json({
    status: "success",
    message: "Connected successfully!",
  }),
);

// This route is used for the Webhook.
app.post("/callback", async (c) => {
  const callbackRequest: line.webhook.CallbackRequest = await c.req.json();
  const events: line.webhook.Event[] = callbackRequest.events;

  console.log(events);

  // Process all the received events asynchronously.
  const results = await Promise.all(
    events.map(async (event: line.webhook.Event) => {
      try {
        await textEventHandler(event);
      } catch (err: unknown) {
        if (err instanceof line.HTTPFetchError) {
          console.error(err.status);
          console.error(err.headers.get("x-line-request-id"));
          console.error(err.body);
        } else if (err instanceof Error) {
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

export default app;

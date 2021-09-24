import { err } from "../server/helpers";
import { app } from "../server";

app.post("/aws/:service", (req, res) => {
  const service = req.params.service;
  if (service === "handle-email-complaints") {
    if (
      req.headers["x-amz-sns-message-type"] === "Notification" &&
      req.body.message
    ) {
      // handle notification
      console.log("[SNS Notification]", req.body.message);
    } else if (
      req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation"
    ) {
      // handle subscription confirmation
      console.log("[SNS SubscriptionConfirmation]", req.body.Token);
    }
    res.status(200).send(
      JSON.stringify({
        success: true,
        message: "Successfully received message",
      })
    );
  } else {
    res.send(err(`/aws/${service} is not implemented yet.`));
  }
});

import { err } from "../server/helpers";
import { app, prisma } from "../server";

const handleMessage = async (message: any) => {
  if (message.notificationType === "Complaint") {
    const complainedRecipients = message.complaint.complainedRecipients;
    try {
      complainedRecipients.forEach(async (rec: any) => {
        await prisma.awsEmailComplaints.create({
          data: {
            complaintSubType: message.complaint.complaintSubType,
            recipientEmail: rec.emailAddress,
            complaintFeedbackType: message.complaint.complaintFeedbackType,
            arrivalDate: message.complaint.arrivalDate,
            messageId: message.complaint.mail.messageId,
            sourceArn: message.complaint.mail.sourceArn,
            sourceIp: message.complaint.mail.sourceIp,
          },
        });
      });
    } catch (e) {
      console.error("Failed to save email complaint.");
      console.error(e);
    }
  } else if (message.notificationType === "Bounce") {
    const bouncedRecipients = message.bounce.bouncedRecipients;
    try {
      bouncedRecipients.forEach(async (rec: any) => {
        await prisma.awsEmailBounces.create({
          data: {
            bounceType: message.bounce.bounceType,
            recipientEmail: rec.emailAddress,
            bouncedAt: message.timestamp,
            messageId: message.bounce.mail.messageId,
            sourceIp: message.bounce.mail.sourceIp,
            sourceArn: message.bounce.mail.sourceArn,
          },
        });
      });
    } catch (e) {
      console.error("Failed to save email bounce.");
      console.error(e);
    }
  }
};

app.post("/aws/:service", (req, res) => {
  const service = req.params.service;
  if (service === "handle-email-complaints") {
    if (req.headers["x-amz-sns-message-type"] === "Notification") {
      // handle notification
      let message = req.body.Message;
      handleMessage(message);
    } else if (
      req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation"
    ) {
      // handle subscription confirmation
      console.log("[SNS SubscriptionConfirmation] Token: ", req.body.Token);
    } else {
      console.log("[SNS RECEIVED: UNCATEGORIZED]", req.body.Message);
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

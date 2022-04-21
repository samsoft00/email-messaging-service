require("dotenv").config({ verbose: true });
const pkg = require("../package.json");
const { PubSub } = require("@google-cloud/pubsub");
const express = require("express");
const Bugsnag = require("@bugsnag/js");
const BugsnagPluginExpress = require("@bugsnag/plugin-express");

// Mails
const MoniexMail = require("./mails/moniex/moniex.mail");
const {
  fxSendAssignToMail,
  sendInvoiceMail,
  loanSendAssignToMail,
  loginEmail,
  sendResetPassword,
  sendFxReport,
  notifyApproveAuth,
  clientAuthorizedEmail,
  sendBdcReportMail,
} = require("./mails");

const { PORT, EMAIL_BROADCAST_SUBSCRIPTION, BUGSNAG_API_KEY } = process.env;
const pubSubClient = new PubSub({ keyFilename: process.env.GQUEUE_KEYFILE });

Bugsnag.start({
  apiKey: BUGSNAG_API_KEY,
  plugins: [BugsnagPluginExpress],
});

const app = express();
const middleware = Bugsnag.getPlugin("express");

app.use(middleware.requestHandler);

app.get("/", async (req, res) => {
  return res.status(200).json({
    success: true,
    message: `CPG Mail Service v${pkg.version}`,
  });
});

// Listen to message from GC
const listenForMessages = async () => {
  const subscription = pubSubClient.subscription(EMAIL_BROADCAST_SUBSCRIPTION);

  const messageHandler = async (message) => {
    // const payload = JSON.parse(`${message.data}`);
    const payload = JSON.parse(message.data);

    // Title:CanaryFx -> send Canary Fx mail
    if (/:CanaryFx/.test(payload.email_type)) {
      const i = payload.email_type.split(":");

      const fxMail = new MoniexMail(i.shift(), payload);
      await fxMail.send();

      return message.ack();
    }

    switch (payload.email_type) {
      case "LoginEmail":
        await loginEmail(payload);
        break;
      case "SendBdcReportMail":
        await sendBdcReportMail(payload);
        break;
      case "InvoiceEmail":
        await sendInvoiceMail(payload);
        break;
      case "PasswordReset":
        await sendResetPassword(payload);
        break;
      case "SendAssignToMailFx":
        await fxSendAssignToMail(payload);
        break;
      case "SendAssignToMail":
        await loanSendAssignToMail(payload);
        break;
      case "NotifyApprovalAuth":
        await notifyApproveAuth(payload);
        break;
      case "ClientAuthorizedEmail":
        await clientAuthorizedEmail(payload);
        break;
      case "ExportFileToCsv":
      case "ExportLoanToCsv":
        await sendFxReport(payload);
        break;
      default:
        throw new Error(`Email Type: ${payload.email_type} - not implemented!`);
    }

    message.ack();
  };

  subscription.on("message", messageHandler);
};

app.use(middleware.errorHandler);

app.listen(PORT, () => {
  listenForMessages().catch((e) => Bugsnag.notify(e));
  console.log(`Mail Service listening at ${PORT}`);
});

const { fxSendAssignToMail } = require("./fx-send-assign.mail");
const { sendInvoiceMail } = require("./invoice.email");
const { loanSendAssignToMail } = require("./loan-send-assign.mail");
const { loginEmail } = require("./login.email");
const { sendResetPassword } = require("./reset-password.email");
const { sendFxReport } = require("./send-report.mail");
const { notifyApproveAuth } = require("./approve-auth.mail");
const { clientAuthorizedEmail } = require("./client-auth-mail");
const { sendBdcReportMail } = require("./bdc-report-mail");

module.exports = {
  fxSendAssignToMail,
  sendInvoiceMail,
  loanSendAssignToMail,
  loginEmail,
  sendResetPassword,
  sendFxReport,
  notifyApproveAuth,
  clientAuthorizedEmail,
  sendBdcReportMail,
};

const MailService = require("../mail.service");

/**
 * If a loan is in Management and ready to be approved.
 * send a notification to the correct approval authority(ies) so they know to check and approve
 * @method
 * notifyApproveAuth
 */
exports.notifyApproveAuth = async (data) => {
  const { email, name, amount, frontend_login_url, reference_no, created_at } =
    data;

  const mailer = new MailService();

  // send a mail to auth
  const mailContent = await mailer.loadContent("loan-approval-auth", {
    name,
    amount,
    reference_no,
    frontend_login_url,
    created_at,
  });

  await mailer.sendEmail(
    email,
    mailContent,
    `Loan Ref:#${reference_no}, waiting for approval!`
  );
};

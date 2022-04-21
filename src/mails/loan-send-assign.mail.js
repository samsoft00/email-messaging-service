const MailService = require("../mail.service");

/**
 * Process mail
 * @method
 * loanSendAssignToMail: send notification to user
 */

exports.loanSendAssignToMail = async (data) => {
  const {
    fullname,
    frontend_login_url,
    from_who,
    refrence_no,
    name,
    to,
    created_at,
  } = data;

  const mailer = new MailService();
  const mailContent = await mailer.loadContent("loan-assign", {
    fullname,
    frontend_login_url,
    from_who,
    refrence_no,
    name,
    created_at,
  });

  await mailer.sendEmail(
    to,
    mailContent,
    `Loan Ref:#${refrence_no}, waiting for approval!`
  );
};

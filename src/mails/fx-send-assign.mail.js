const MailService = require("../mail.service");

/**
 * Process mail
 * @method
 * fxSendAssignToMail: send notification to user
 */

exports.fxSendAssignToMail = async (data) => {
  const {
    fullname,
    frontend_login_url,
    from_who,
    reference_no,
    name,
    email,
    created_at,
  } = data;

  const mailer = new MailService("Sebastian BDC");
  const mailContent = await mailer.loadContent("loan-assign", {
    fullname,
    frontend_login_url,
    from_who,
    reference_no,
    name,
    created_at,
  });

  await mailer.sendEmail(
    email,
    mailContent,
    `Fx Order Ref:#${reference_no}, waiting for approval!`
  );
};

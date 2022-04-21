const MailService = require("../mail.service");

/**
 * Process password reset mail
 * @method
 * sendResetPassword: Send update password to user
 */

exports.sendResetPassword = async (data) => {
  const { reset_token, frontend_login_url, email, fullname } = data;

  const mailer = new MailService();
  const mailContent = await mailer.loadContent("reset-password", {
    link: `${frontend_login_url}/reset-password?token=${reset_token}`,
    name: fullname,
  });

  await mailer.sendEmail(email, mailContent, "Reset password");
};

const MailService = require("../mail.service");

/**
 * Login mail
 * @method
 * loginEmail: Send login credential to user
 */

exports.loginEmail = async (data) => {
  const { fullUrl, user, password } = data;
  const { phone_number, username, email } = user;

  const mailer = new MailService();
  const mailContent = await mailer.loadContent("login", {
    fullUrl,
    email,
    password,
  });

  const smsContent = `Congratulations, Your username is ${username} and your password is ${password}`;

  await mailer.sendEmail(email, mailContent, "Registration");
  mailer.sendSMSToPhone(phone_number, smsContent);
};

const MailService = require("../mail.service");
const got = require("got");

/**
 * @method
 * clientAuthorizedEmail
 */
exports.clientAuthorizedEmail = async (data) => {
  const { customer, title, link: authorizeLink, file } = data;

  const mailer = new MailService("Sebastian BDC");
  const mailContent = await mailer.loadContent("client-authorize-mail", {
    ...customer,
    authorizeLink,
  });
  /*
  Remove attachment for now
  const r = await got.get(file.path, { throwHttpErrors: false });

  const filer = {
    content: Buffer.from(r.rawBody).toString("base64"),
    type: "application/pdf",
    filename: file.filename,
  };
*/
  await mailer.sendEmail(customer.email, mailContent, title); // true, filer
};

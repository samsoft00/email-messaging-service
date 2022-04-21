const MailService = require("../mail.service");
const got = require("got");

/**
 * Process customer invoice mail
 * @method
 * sendInvoiceMail: Send invoice to user
 */

exports.sendInvoiceMail = async (data) => {
  const {
    customer,
    title,
    generated_date,
    amount_in_naira,
    current_rate,
    file_url,
    invoice_no,
  } = data;

  const mailer = new MailService("Sebastian BDC");
  const mailContent = await mailer.loadContent("invoice-email", {
    email: customer.email,
    fullname: customer.name,
    generated_date,
    amount_in_naira,
    current_rate,
  }); // cf.format(payload.rate, { code: currency_to.locale })

  const r = await got.get(file_url, { throwHttpErrors: false });

  const filer = {
    content: Buffer.from(r.rawBody).toString("base64"),
    type: "application/pdf",
    filename: `${invoice_no}-invoice.pdf`,
  };

  await mailer.sendEmail(customer.email, mailContent, title, true, filer);
};

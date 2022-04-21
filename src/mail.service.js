const log = require("fancy-log");
const path = require("path");
const sgMail = require("@sendgrid/mail");
const helper = require("@sendgrid/helpers");
const { Liquid } = require("liquidjs");

const SmsService = require("./sms.service");

const { DEFAULT_EMAIL, SENDGRID_API_KEY } = process.env;

// setup liquid
const engine = new Liquid({
  root: path.join(__dirname, "/templates"),
  extname: ".liquid",
});

// setup sendgrid api
sgMail.setApiKey(SENDGRID_API_KEY);

// Sebastian BDC
// Canary Point Group
class MailService {
  constructor(name = "Canary Point Group", email = `${DEFAULT_EMAIL}`) {
    this.senderName = name;
    this.senderEmail = email;
  }

  async sendEmail(
    receiver,
    content,
    subject,
    attachRequired = false,
    file = {}
  ) {
    try {
      const r = {
        ...(Object.is(typeof receiver, "object") && {
          name: receiver.name,
          email: receiver.email,
        }),
        ...(!Object.is(typeof receiver, "object") && { email: receiver }),
      };

      const from_email = new helper.classes.EmailAddress({
        name: this.senderName,
        email: this.senderEmail,
      });
      const to_email = new helper.classes.EmailAddress(r);

      // subject = `[${this.senderName}] ${subject}`;
      // content = new helper.classes.("text/html", content);

      const mail = new helper.classes.Mail({
        to: to_email,
        from: from_email,
        subject,
        content: [{ type: "text/html", value: content }],
      });

      if (attachRequired) {
        const attach = new helper.classes.Attachment();

        // const { filename, file_path } = file;
        // const data = fs.readFileSync(file_path).toString('base64');

        attach.setContent(file.content);
        attach.setType(file.type);
        attach.setFilename(file.filename);
        attach.setDisposition("attachment");

        mail.addAttachment(attach);
      }

      const response = await sgMail.send(mail);

      log.info(
        `Email sent successfully with statusCode: ${response[0].statusCode}`
      );
      log(response[0].headers);
    } catch (error) {
      throw error;
    }
  }

  async sendSMSToPhone(phone, content) {
    await new SmsService().send(phone, content);
    log(`send sms to phone: ${phone} the content is ${content}`);
  }

  /**
   * Load content from templates
   * & compile using LIQUIDJS
   */
  async loadContent(template, tmpobj) {
    return engine.renderFile(template, tmpobj);
  }
}

module.exports = MailService;

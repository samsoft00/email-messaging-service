const MailService = require("../../mail.service");
const got = require("got");

// key => value
const FRONTEND_BASE_URL = "https://canaryfx.staging-cpg.online";
const FRONTEND_VERIFICATION_URL = "https://canaryfx.staging-cpg.online/verify-email/";
const FRONTEND_RESET_PASSWORD = "https://canaryfx.staging-cpg.online/reset-password/";

// const moniex_domain
const MailType = {
  RESET_PIN: "reset_pin",
  LOGIN_ALERT: "login_alert",
  RESET_PASSWORD: "reset_password",
  // SEND_CONFIRMATION_SMS: 'send_confirmation_sms',
  ACCOUNT_CONFIRMATION: "account_confirmation",
  SUCCESSFUL_REGISTRATION: "successful_registration",
  TRANSACTION_CONFIRMATION: "confirm_transaction",
  RESEND_CONFIRMATION_SMS: "resend_confirmation_sms",

  PIN_RESET_NOTIFICATION: "pin_reset_notification",
  SEND_TRANSACTION_OTP: "transaction_otp",
  REQUEST_RESET_OTP: "request_reset_otp",
  GENERAL_PURPOSE_OTP: "general_purpose_otp",
};

const templateVariables = {
  current_year: new Date().getFullYear(),
  moniex_domain: FRONTEND_BASE_URL,
  facebook_link: "https://facebook.com/moniex",
  twitter_link: "https://twitter.com/moniex",
  instagram_link: "https://instagram.com/moniex",
};

/**
 * CanaryFxMail
 * Mail Service for CanaryFx product
 */
class MonieXMail extends MailService {
  constructor(mailType, payload) {
    super("MonieX Exchange");

    this.payload = payload;
    this.mailType = mailType;

    this.title = null;
    this.smsOnly = false;
    this.mail_content = null;
    this.sms_contents = null;
    this.attachedRequired = false;
    this.file = {};
  }

  async send() {
    const mailer = await this.setupMail();

    if (this.payload.send_sms) {
      await mailer.sendSMSToPhone(this.payload.phone_number, this.sms_contents);
    }

    if (!mailer || this.smsOnly) return Promise.resolve();

    return mailer.sendEmail(
      {
        name: `${this.payload.first_name} ${this.payload.last_name}`,
        email: this.payload.email,
      },
      this.mail_content,
      this.title,
      this.attachedRequired,
      this.file
    );
  }

  async setupMail() {
    const types = {
      // [MailType.RESET_PIN]: () => this.resetPin(),
      [MailType.LOGIN_ALERT]: () => this.loginAlert(),
      [MailType.RESET_PASSWORD]: () => this.resetPassword(),
      [MailType.SUCCESSFUL_REGISTRATION]: () => this.successfulReg(),
      [MailType.TRANSACTION_CONFIRMATION]: () => this.confirmTransaction(),
      [MailType.ACCOUNT_CONFIRMATION]: () => this.sendEmailConfirmation(),
      [MailType.PIN_RESET_NOTIFICATION]: () => this.pinResetNotification(),
      [MailType.SEND_TRANSACTION_OTP]: () => this.transactionOtp(),
      [MailType.REQUEST_RESET_OTP]: () => this.requestResetOtp(),
      [MailType.RESEND_CONFIRMATION_SMS]: () => this.resendConfirmationSms(),
      [MailType.GENERAL_PURPOSE_OTP]: () => this.generalPurposeHandler(),
    };

    if (types[this.mailType]) return types[this.mailType]();
    throw new Error(`CanaryFx Mail: ${this.mailType} not implemented!`);
  }

  async generalPurposeHandler() {
    const i = this.payload.validation_type.toLowerCase().split("_").join(" ");
    this.title = `Otp to ${i}`;
    this.sms_contents = `${this.payload.otp} is your one time password (OTP) to complete your ${i} on MonieX`;

    this.mail_content = await this.loadContent("moniex/general-purpose-otp", {
      otp: this.payload.otp,
      title: this.title,
      ...this.payload,
      ...templateVariables,
    });

    return this;
  }

  // Send email once transaction is successful
  async confirmTransaction() {
    const {
      email,
      invoice_url,
      filename,
      customer_name,
      reference_no,
      transaction_type,
      payment_option,
    } = this.payload;

    if (![undefined, null, ''].includes(invoice_url)) {
      const r = await got.get(invoice_url, { throwHttpErrors: false });

      this.attachedRequired = true;
      this.file = {
        filename,
        type: "application/pdf",
        content: Buffer.from(r.rawBody).toString("base64"),
      };
    }

    this.title = `Transaction #${reference_no} created`;
    this.mail_content = await this.loadContent(
      "moniex/transaction-confirmation",
      {
        customer_email: email,
        customer_name: customer_name,
        reference_no: reference_no,
        transaction_type: transaction_type,
        payment_option: payment_option,
        title: this.title,
        ...templateVariables,
      }
    );

    return this;
  }

  async successfulReg() {
    this.title = "Registration Successful";

    this.mail_content = await this.loadContent("moniex/register-success", {
      customer_name: this.payload.name,
      title: "Congratulations",
      ...templateVariables,
    });

    return this;
  }

  async resetPassword() {
    this.title = "Forgot your password?";

    this.mail_content = await this.loadContent("moniex/reset-password", {
      customer_name: this.payload.email,
      reset_link_url: `${FRONTEND_RESET_PASSWORD}${this.payload.reset_token}`,
      title: "Forgot your password?",
      ...templateVariables,
    });

    return this;
  }

  /**
   * Send Confirmation mail to customer
   * @returns CanaryFxMail
   */
  async sendEmailConfirmation() {
    // set payload, title and content
    this.title = "Verify your email";
    this.sms_contents = `SMS sample for MonieX account verification code. ${this.payload.verification_code}`;

    this.mail_content = await this.loadContent("moniex/verification-mail", {
      verification_code: this.payload.verification_code,
      customer_name: this.payload.name,
      link_url: `${FRONTEND_VERIFICATION_URL}` + this.payload.link,
      title: "Verify Email Address",
      ...templateVariables,
    });

    return this;
  }

  /**
   * This method resend confirmation sms.
   * @returns MonieXMail
   */
  async resendConfirmationSms() {
    this.smsOnly = true;
    this.sms_contents = `SMS sample for MonieX account verification code. ${this.payload.verification_code}`;

    return this;
  }

  async transactionOtp() {
    this.title = `Complete your transaction #${this.payload.reference_no}`;
    this.sms_contents = `${this.payload.transaction_otp} is your one time password (OTP) to complete your transaction on MonieX`;

    this.mail_content = await this.loadContent("moniex/transaction-otp", {
      transaction_otp: this.payload.transaction_otp,
      title: "Transaction OTP",
      ...templateVariables,
    });

    return this;
  }

  // SMS sample for MonieX account verification code.
  async requestResetOtp() {
    this.smsOnly = true;

    this.title = "Reset Transaction PIN";
    this.sms_contents = `${this.payload.otp} is your one time password (OTP) to complete you pin reset process`;

    return this;
  }

  async loginAlert() {
    this.title = "Login Notification";

    this.mail_content = await this.loadContent("moniex/login-alert", {
      customer_name: this.payload.name,
      login_datetime: this.payload.login_datetime,
      login_ip: this.payload.login_ip,
      title: "Login Notification",
      ...templateVariables,
    });

    return this;
  }

  // only email
  async pinResetNotification() {
    // pin reset notification
    this.title = "Your transaction PIN has been updated.";

    this.mail_content = await this.loadContent("moniex/reset-pin", {
      customer_name: this.payload.email,
    });

    return this;
  }
}

module.exports = MonieXMail;

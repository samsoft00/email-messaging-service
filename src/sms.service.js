const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
  process.env;

const TWILIO_CLIENT = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Send sms from Twilio
 */
class SmsService {
  constructor(sender = TWILIO_PHONE_NUMBER) {
    this.sender = sender;
  }

  async send(receiver, message) {
    await TWILIO_CLIENT.messages.create({
      body: message,
      from: this.sender,
      to: receiver,
    });
  }
}

module.exports = SmsService;

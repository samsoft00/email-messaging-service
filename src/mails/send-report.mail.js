const MailService = require("../mail.service");
const got = require("got");

exports.sendFxReport = async (data) => {
  const { user, title, file_path, file_name, email_type, summary } = data;
  const type = email_type === "ExportLoanToCsv" ? "Loan Orders" : "FX Orders";
  if (summary) {
    "Quick Summary \r" + summary;
  }

  const html = `<!doctype html>
  <html lang="en">
  <head></head>
  <body>
      <div style="color: black">
        <h4>Hi ${
          user.fullname.split(" ")[1] !== undefined
            ? user.fullname.split(" ")[1]
            : user.fullname.split(" ")[0]
        }</h4>
        <p>Your ${type} report is ready, kindly see attached document.</p>
        <br/>
        ${summary}
        <br/>
        <p>Thank You!</p>
        <p>Team</p>
      </div>
  </body>
  </html>`;

  const r = await got.get(file_path, { throwHttpErrors: false });

  const filer = {
    content: Buffer.from(r.rawBody).toString("base64"),
    type: "text/csv",
    filename: file_name,
  };

  const mailer = new MailService();
  await mailer.sendEmail(user.email, html, title, true, filer);
};

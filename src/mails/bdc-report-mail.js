const MailService = require("../mail.service");

/**
 * Send BDC Report
 * @method
 * sendBdcReportMail: Send bdc report to user
 */

exports.sendBdcReportMail = async (data) => {
  const { download_link, fullname, report_date, email } = data;
  const title = `BDC Order report for ${report_date}`;

  const html = `<!doctype html>
    <html lang="en">
    <head></head>
    <body>
        <div style="color: black">
          <h4>Hi ${
            fullname.split(" ")[1] !== undefined
              ? fullname.split(" ")[1]
              : fullname.split(" ")[0]
          }</h4>
          <p>Your BDC Order report is ready, kindly click on the link below to download.</p>
          <br/>
          <a href=${download_link} target="_blank">${title}</a>
          <br />      
          <p>Thank You!</p>
          <p>Team </p>
          <br/>
          <img id="logo" src="https://sebastianbdc.com/wp-content/uploads/2017/02/logo.jpg"
              title="Sebastian Bureau De Change, Ltd" alt="Sebastian Bureau De Change, Ltd" />
        </div>
    </body>
    </html>`;

  const mailer = new MailService("Sebastian BDC");
  await mailer.sendEmail(email, html, title, false);
};

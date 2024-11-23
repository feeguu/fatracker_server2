const fs = require("fs");
const nodemailer = require("nodemailer");
const Config = require("../config/config");
const handlebars = require("handlebars");

const Templates = {
  TWO_FACTOR: "twoFactor",
  NEW_STAFF: "newStaff",
};

const compiledTemplates = {};

for (const template in Templates) {
  const filePath = `./templates/${Templates[template]}.hbs`;
  fs.promises
    .readFile(filePath, "utf8")
    .then(
      (data) =>
        (compiledTemplates[Templates[template]] = handlebars.compile(data))
    )
    .catch((error) => {
      throw Error(
        `Failed to load template: ${Templates[template]} at path ${error.path}`
      );
    });
}

class MailService {
  constructor() {
    const config = Config.getInstance();

    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
    });

    this.transporter.verify((error) => {
      if (error) {
        console.error("Error verifying transporter", error);
        throw error;
      }
    });

    this.from = config.email.from;
  }

  async sendMail(to, subject, template, data) {
    if (!compiledTemplates[template]) {
      throw new Error("Invalid template");
    }
    const html = compiledTemplates[template](data);

    const mailOptions = {
      from: this.from,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Email sent");
    } catch (error) {
      console.error("Error sending email", error);
    }
  }
}

module.exports = { MailService, Templates };

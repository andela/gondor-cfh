import nodemailer from 'nodemailer';

/**
 * @class MailController
 */
class MailController {
  /**
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   *
   * @returns {undefined} - undefined
   */
  static sendMail(req, res) {
    const { receiver, html, subject } = req.body;
    let sender;
    if (req.decoded) {
      sender = req.decoded.email;
    } else {
      sender = process.env.MAIL_USER;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: sender,
      to: receiver,
      subject,
      html
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(400).json({
          error,
        });
      }
      return res.status(200)
        .json({
          message:
            `Message sent successfully to ${info.accepted[0]} with id
             ${info.messageId}`
        });
    });
  }
}

export default MailController;

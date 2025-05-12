
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  const msg = { to, from: 'giovanni.dellelenti@gmail.com', subject, text, html };
  return await sgMail.send(msg);
};

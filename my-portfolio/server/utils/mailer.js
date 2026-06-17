import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = {
  sendMail: async (options) => {
    let fromEmail = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    let fromName = 'Portfolio App';

    if (options.from) {
      if (typeof options.from === 'string') {
        const match = options.from.match(/^(.+?)\s*<(.+)>$/);
        if (match) {
          fromName = match[1].trim();
          fromEmail = match[2].trim();
        } else {
          fromEmail = options.from.trim();
        }
      }
    }

    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('Resend API key is not configured. Please set RESEND_API_KEY in your environment variables.');
      }

      console.log('=== SENDING EMAIL VIA RESEND ===');
      console.log('From:', `${fromName} <${fromEmail}>`);
      console.log('To:', options.to);
      console.log('Subject:', options.subject);

      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(error.message || 'Failed to send email via Resend');
      }

      console.log('✅ Email sent successfully via Resend');
      console.log('Email ID:', data?.id);
      return data;
    } catch (error) {
      console.error('❌ Resend error occurred:');
      console.error('Error message:', error.message);
      throw error;
    }
  }
};

export default transporter;

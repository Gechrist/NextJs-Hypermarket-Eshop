import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import sendEmail from '@sendgrid/mail';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) => {
  const signPasswordToken = (): string => {
    return jwt.sign(
      {
        email: req.body.data,
      },
      process.env.NEXT_PUBLIC_JWT_SECRET as string,
      { expiresIn: '1h' }
    );
  };

  sendEmail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const passwordToken = signPasswordToken();
  const Msg = {
    to: req.body.data,
    from: 'hypermarket.passreset@gmail.com',
    subject: 'Password Reset',
    html: `<h2>This is an automated message from the Hypermarket Eshop.</h2> <p>There was a request to reset your password.</p> <p>If you did not make this request, please ignore this email.</p> <p>Otherwise, please click this link to change your password: <a href='${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/newpassword/${passwordToken}'>${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/newpassword/${passwordToken}</a></p> <p>The link will expire in an hour. Do not reply to this message.</p>`,
  };
  try {
    const result = await sendEmail.send(Msg);
    if (result) {
      res.send({ message: 'Password reset email sent.' });
    }
  } catch (e) {
    console.log({ error: e as Error });
    res.send({ error: 'Something went wrong. Please try again.' });
  }
};

export default handler;

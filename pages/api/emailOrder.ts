import { NextApiRequest, NextApiResponse } from 'next';
import sendEmail from '@sendgrid/mail';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { error: string }>
) => {
  const link = req.body.data.id;
  sendEmail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const Msg = {
    to: req.body.data.email,
    from: 'hypermarket.passreset@gmail.com',
    subject: 'Your Order at Hypermarket',
    html: `<h2 style='text-align:center'>THANK YOU FOR YOUR ORDER</h2> <p style='text-align:center'>You can view your order details <a href='${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/order/${link}'>here</a></p style='text-align:center'> <p>Do not reply to this message.</p>`,
  };
  try {
    const result = await sendEmail.send(Msg);
    if (result) {
      res.send({ message: 'Order email sent.' });
    }
  } catch (e) {
    console.log({ error: e as Error });
    res.send({ error: 'Something went wrong. Please try again.' });
  }
};

export default handler;

import { NextApiRequest, NextApiResponse } from 'next';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY as string);

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  try {
    const amount = req.body.amount * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      payment_method_types: ['card'],
    });
    res.send(paymentIntent);
  } catch (e: any) {
    res.send(e.type);
    switch (e.type) {
      case 'StripeCardError':
        console.log(`A payment error occurred: ${e.message}`);
        break;
      case 'StripeInvalidRequestError':
        console.log('An invalid request occurred.');
        break;
      default:
        console.log('Another problem occurred, maybe unrelated to Stripe.');
        break;
    }
  }
};
export default handler;

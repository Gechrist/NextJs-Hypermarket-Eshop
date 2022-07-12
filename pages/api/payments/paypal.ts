import { NextApiResponse } from 'next';

const handler = async (res: NextApiResponse<string>) => {
  res.send((process.env.PAYPAL_CLIENT_ID as string) || 'sb');
};

export default handler;

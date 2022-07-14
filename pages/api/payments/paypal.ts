import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  if (req) {
    res.send((process.env.PAYPAL_CLIENT_ID as string) || 'sb');
  }
};

export default handler;

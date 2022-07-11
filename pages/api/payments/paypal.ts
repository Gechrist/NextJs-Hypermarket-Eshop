import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  res.send((process.env.PAYPAL_CLIENT_ID as string) || 'sb');
};

export default handler;

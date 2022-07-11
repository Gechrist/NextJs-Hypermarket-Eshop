import { FC } from 'react';
import Head from 'next/head';

type Props = {
  title: string;
};

const Meta: FC<Props> = ({ title }: Props) => {
  return (
    <>
      <Head>
        <title>{`Hypermarket - ${title}`}</title>
        <meta property="og:title" title={`${title}`} key="title" />
      </Head>
    </>
  );
};

export default Meta;

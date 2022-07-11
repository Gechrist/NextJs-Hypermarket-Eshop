import Link from 'next/link';
import Meta from '../components/meta';

const About = () => {
  return (
    <div className="text-justify mt-20 px-8">
      <Meta title="About" />
      <h3>
        This is a mock eshop built with Next.JS, Tailwind and a variety of
        services such as SendGrid, Gmail, NextAuth, Stripe and others. It is
        fully functioning in the sense that orders and payments can be made
        through PayPal and credit cards using sandbox accounts and transactional
        emails will be received. An administrative backend has also been built.
        For more information visit the{' '}
        <p className="link inline">
          <Link href="https://geChrist.github.com/Hypermarket" passHref>
            GitHub repository
          </Link>
        </p>
      </h3>
    </div>
  );
};

export default About;

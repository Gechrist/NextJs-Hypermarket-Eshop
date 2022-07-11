import LoadingIcon from '../public/icons/three-dots.svg';
import { usePromiseTracker } from 'react-promise-tracker';
import Image from 'next/image';

const LoadingIndicator = () => {
  const { promiseInProgress } = usePromiseTracker();

  return (
    (promiseInProgress && (
      <Image
        aria-label="Awaiting for data..."
        src={LoadingIcon}
        alt="Loading animation"
      />
    )) ||
    null
  );
};

export default LoadingIndicator;

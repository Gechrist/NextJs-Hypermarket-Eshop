import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import Image from 'next/image';
import jwt from 'jsonwebtoken';
import EyeIcon from '../../public/icons/eye.svg';
import EyeSlashIcon from '../../public/icons/eye-slash.svg';

type formData = { email: string; password: string };

const ResetPassword = () => {
  const router = useRouter();
  const [requestEmail, setRequestEmail] = useState<string>('');
  const [tokenError, settokenError] = useState<boolean>(false);
  const token: string = router.query.token as string;

  useEffect(() => {
    if (token) {
      const tokenCheck: any = jwt.verify(
        token,
        process.env.NEXT_PUBLIC_JWT_SECRET as string,
        (err, decode) => {
          if (err) {
            settokenError(true);
            return { error: 'Invalid token' };
          } else {
            setRequestEmail(decode!.email);
          }
        }
      );
      if (tokenCheck?.error) {
        toast.error(tokenCheck.error);
      }
    }
  }, [token]);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<formData> = async (reqData: formData, e) => {
    e!.preventDefault();
    try {
      const response = await fetch('/api/updateDbData', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { ...reqData, email: requestEmail, token },
          type: 'User',
        }),
      });
      const notification = await response.json();
      if (
        notification.message.includes('error') ||
        notification.message.includes('not found')
      ) {
        toast.error(notification.message);
      } else {
        toast.success(notification.message);
      }
    } catch (e) {
      console.log((e as Error).message);
      toast.error(`An unexpected error has occured: ${(e as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col text-black w-5/6 md:w-4/6 mt-20 mx-auto space-y-10 border-2 border-black bg-white p-2 rounded">
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div className="flex-row relative">
          <input
            type={showPassword ? 'text' : 'password'}
            maxLength={16}
            className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
            aria-invalid={errors.password ? 'true' : 'false'}
            placeholder="Your new password"
            {...register('password', {
              required: { value: true, message: 'Password is required' },
              pattern: {
                value:
                  /(?=^.{8,20}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/,
                message:
                  'Password must contain at least one capital letter, one small-case letter, one digit, 1 special character and the length must be between 8 and 16 characters',
              },
            })}
          />
          <div className="block right-1 bottom-5 absolute h-4 w-4">
            <Image
              src={showPassword ? EyeIcon : EyeSlashIcon}
              alt="show/hide password"
              layout="fill"
              objectFit="contain"
              onClick={() => setShowPassword((prevState) => !prevState)}
            />
          </div>
        </div>
        {errors.password && (
          <span role="alert" className="text-red-600">
            {errors.password.message}
          </span>
        )}
        <input
          type={showPassword ? 'text' : 'password'}
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          placeholder="Confirm your new password"
          {...register('confirmPassword', {
            required: {
              value: true,
              message: 'Please confirm your new password',
            },
            validate: {
              matchesPreviousPassword: (value: string) => {
                const { password } = getValues();
                return password === value || 'The passwords do not match';
              },
            },
          })}
        />
        {errors.confirmPassword && (
          <span className="text-red-600" role="alert">
            {errors.confirmPassword.message}
          </span>
        )}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full lg:w-3/6"
            disabled={tokenError ? true : false}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

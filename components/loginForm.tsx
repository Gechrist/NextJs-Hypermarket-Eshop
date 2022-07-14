import React, { useState, FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { formData } from './login&cart';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Image from 'next/image';
import EyeIcon from '../public/icons/eye.svg';
import EyeSlashIcon from '../public/icons/eye-slash.svg';

type Props = {
  loginWindow?: React.Dispatch<React.SetStateAction<boolean>> | null;
};

const LoginForm: FC<Props> = ({ loginWindow }: Props) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit: SubmitHandler<formData> = async (data: formData, e) => {
    e!.preventDefault();
    const signInStatus = await signIn('credentials', {
      ...data,
      redirect: false,
    });
    if (signInStatus!.error !== null) {
      toast.error('Invalid credentials. Please check again');
    }
    if (signInStatus!.ok) {
      if (loginWindow) {
        loginWindow(false);
      }
      if (router.pathname.includes('login')) {
        router.push('/');
      }
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <input
          type="text"
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          aria-invalid={errors.email ? 'true' : 'false'}
          placeholder="Your email"
          {...register('email', {
            required: { value: true, message: 'Email is required' },
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Please enter a valid email address',
            },
          })}
        />
        {errors.email && <span role="alert">{errors.email.message}</span>}
        <div className="flex-row relative">
          <input
            type={showPassword ? 'text' : 'password'}
            maxLength={16}
            className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
            aria-invalid={errors.password ? 'true' : 'false'}
            placeholder="Your password"
            {...register('password', {
              required: { value: true, message: 'Password is required' },
            })}
          />
          <div className="block right-1 bottom-6 absolute h-4 w-4 cursor-pointer bg-white">
            <div className="ml-10">
              <Image
                src={showPassword ? EyeIcon : EyeSlashIcon}
                alt="show/hide password"
                layout="fill"
                objectFit="contain"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            </div>
          </div>
        </div>
        {errors.password && <span role="alert">{errors.password.message}</span>}
        <div className="flex justify-center">
          <button className="w-full lg:w-3/6" type="submit">
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

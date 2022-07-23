import React, { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { User as UserData } from '../../data/seedData';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import EyeIcon from '../../public/icons/eye.svg';
import EyeSlashIcon from '../../public/icons/eye-slash.svg';

const NewUserProfile: FC = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();
  const { data: session } = useSession();

  const formHandle = async (reqData: UserData): Promise<void> => {
    try {
      const response = await fetch('/api/createDbData', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: reqData, type: 'user' }),
      });
      const notification = await response.json();
      if (notification.message.includes('duplicate key')) {
        toast.error('This email is already in use');
        return;
      }
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

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<UserData> = (data) => formHandle(data);

  return (
    <div className="flex flex-col text-black w-5/6 md:w-4/6 mt-20 mx-auto space-y-10 border-2 border-black bg-white p-2 rounded">
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <input
          type="text"
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your Name"
          aria-invalid={errors.name ? 'true' : 'false'}
          {...register('name', {
            required: { value: true, message: 'Name is required' },
          })}
        />{' '}
        {errors.name && (
          <span role="alert" className="text-red-600">
            {errors.name.message}
          </span>
        )}
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
        {errors.email && (
          <span role="alert" className="text-red-600">
            {errors.email.message}
          </span>
        )}
        <div className="flex-row relative">
          <input
            type={showPassword ? 'text' : 'password'}
            maxLength={16}
            className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
            aria-invalid={errors.password ? 'true' : 'false'}
            placeholder="Your password"
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
          maxLength={16}
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          placeholder="Confirm new password"
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
        {session?.isAdmin && (
          <div className="flex flex-row bg-white mx-4 justify-center border-b-2 border-gray-400 space-x-2">
            <label htmlFor="admin">Administrator:</label>
            <input
              className="mb-1"
              type="checkbox"
              id="admin"
              {...register('isAdmin')}
            />
          </div>
        )}
        <input
          type="text"
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your address"
          {...register('address')}
        />
        <input
          type="text"
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your city"
          {...register('city')}
        />
        <input
          type="text"
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your postal code"
          {...register('postalCode')}
        />
        <input
          type="text"
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your country"
          {...register('country')}
        />
        <div className="flex justify-center">
          <button type="submit" className="w-full lg:w-3/6">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewUserProfile;

import React, { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { User as UserData } from '../data/seedData';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import EyeIcon from '../public/icons/eye.svg';
import EyeSlashIcon from '../public/icons/eye-slash.svg';

type Props = {
  formData: UserData;
  formHandle({
    name,
    email,
    password,
    address,
    city,
    postalCode,
    country,
  }: UserData): Promise<void>;
};

const UserProfile: FC<Props> = ({ formData, formHandle }) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const { data: session } = useSession();

  const defaultValues = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    address: formData.address,
    city: formData.city,
    postalCode: formData.postalCode,
    country: formData.country,
    isAdmin: formData.isAdmin,
  };

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<UserData> = (data: UserData, e) => {
    e!.preventDefault();
    formHandle(data);
  };

  return (
    <div className="border-2 border-grey-400 text-black bg-white p-2 rounded">
      <form
        className="flex flex-col space-y-2"
        onSubmit={handleSubmit(onSubmit)}
        method="POST"
      >
        <input
          type="text"
          className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your Name"
          aria-invalid={errors.name ? 'true' : 'false'}
          defaultValue={defaultValues.name}
          {...register('name', {
            required: { value: true, message: 'Name is required' },
          })}
        />{' '}
        {errors.name && <span role="alert">{errors.name.message}</span>}
        <input
          type="text"
          className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
          aria-invalid={errors.email ? 'true' : 'false'}
          placeholder="Your email"
          defaultValue={defaultValues.email}
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
            className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
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
          <div className="block right-1 bottom-5 absolute h-4 w-4 cursor-pointer">
            <Image
              src={showPassword ? EyeIcon : EyeSlashIcon}
              alt="show/hide password"
              layout="fill"
              objectFit="contain"
              onClick={() => setShowPassword((prevState) => !prevState)}
            />
          </div>
        </div>
        {errors.password && <span role="alert">{errors.password.message}</span>}
        <input
          type={showPassword ? 'text' : 'password'}
          maxLength={16}
          className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          placeholder="Confirm your password"
          {...register('confirmPassword', {
            required: {
              value: true,
              message: 'Please confirm your password',
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
          <span role="alert">{errors.confirmPassword.message}</span>
        )}
        {session?.isAdmin && (
          <div className="flex flex-row my-4 justify-center space-x-2 border-b-2 border-gray-400">
            <label htmlFor="admin" className="font-bold">
              Administrator:
            </label>
            <input
              className="relative bottom-1.5 md:bottom-0"
              type="checkbox"
              id="admin"
              defaultChecked={defaultValues.isAdmin}
              {...register('isAdmin')}
            />
          </div>
        )}
        <input
          type="text"
          className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your address"
          defaultValue={defaultValues.address}
          {...register('address')}
        />
        <input
          type="text"
          className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your city"
          defaultValue={defaultValues.city}
          {...register('city')}
        />
        <input
          type="text"
          className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your postal code"
          defaultValue={defaultValues.postalCode}
          {...register('postalCode')}
        />
        <input
          type="text"
          className="bg-white my-4 text-center w-full border-b-2 border-gray-400"
          placeholder="Your country"
          defaultValue={defaultValues.country}
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

export default UserProfile;

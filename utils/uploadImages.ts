import { toast } from 'react-toastify';
import { sha256 } from 'js-sha256';

const uploadImages = async (
  formData: FormData,
  files: Array<string> | string,
  model: string,
  kind: string
) => {
  const connection_uri: string = process.env
    .NEXT_PUBLIC_CLOUDINARY_API_URI as string;
  const timestamp: number = Math.round(new Date().getTime() / 1000);
  const apiKey: string = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string;
  const apiSecret: string = process.env
    .NEXT_PUBLIC_CLOUDINARY_API_SECRET as string;
  let public_id: string = '';

  switch (kind) {
    case 'featuredImage':
      public_id = `${model}_featuredImage`;
      break;
    case 'imageGallery':
      public_id = `${model}_imageGallery`;
      break;
    case 'icon':
      public_id = `${model}_icon`;
      break;
    default:
      break;
  }
  const signature = (id: string) =>
    sha256(`public_id=${id}&timestamp=${timestamp}${apiSecret}`);

  let url: Array<string> = [];

  for (let i = 0; i < files.length; i++) {
    formData.append('file', files[i]);
    formData.append('public_id', `${public_id}_${i}`);
    formData.append('api_key', apiKey!);
    formData.append('timestamp', `${timestamp}`);
    formData.append('signature', signature(`${public_id}_${i}`));

    try {
      const response = await fetch(connection_uri!, {
        method: 'POST',
        body: formData,
      });

      const imgLink = await response.json();
      if (Object.keys(imgLink).includes('error')) {
        toast.error(
          `An unexpected error has occured: ${imgLink.error.message}`
        );
        return;
      }
      url.push(imgLink.secure_url);
    } catch (e) {
      toast.error(`An unexpected error has occured: ${(e as Error).message}`);
      return;
    }
  }
  return url;
};

export default uploadImages;

import { FC } from 'react';

type Props = {
  type: string;
  name: string;
  id: string;
  closeModal(): void;
  deleteHandle(type: string, id: string): Promise<void>;
};

const deleteModal: FC<Props> = ({
  type,
  id,
  name,
  closeModal,
  deleteHandle,
}: Props) => {
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h3 className="text-3xl font-semibold">Delete {type}</h3>
            </div>
            {/*body*/}
            <div className="relative p-6 flex-auto">
              <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                Are you sure you want to delete the {type.toLowerCase()} {name}?
              </p>
            </div>
            {/*footer*/}
            <div className="flex items-center justify-around p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteHandle(type.toLocaleLowerCase(), id);
                  closeModal();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black" />
    </>
  );
};

export default deleteModal;

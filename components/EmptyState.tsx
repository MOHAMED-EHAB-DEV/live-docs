import Image from "next/image";

const EmptyState = ({ message = "Looks like it's empty here! Tap the '+' icon to create a folder or document." }: { message?: string }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 rounded-lg bg-dark-200 px-10 py-8 mt-4">
      <Image
        src="/assets/icons/doc.svg"
        alt="Empty"
        width={40}
        height={40}
        className="opacity-50"
      />
      <h4 className="sm:text-base text-base font-normal text-[#ffffffa6] w-full text-center">
        {message}
      </h4>
    </div>
  );
};

export default EmptyState;

import Image from "next/image";

import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

const GoogleBtn = () => {
  const handleClick = async (redirectUrl: string) => {
    await signIn('google', { callbackUrl: redirectUrl });
  };
  return (
    <Button
      style={{
        boxShadow:
          "rgba(255, 255, 255, 0.07) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 2px 3px -1px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px",
      }}
      className="h-10 w-fit sm:w-[320px] font-medium text-base bg-[#3371ff] text-white pt-[0.375rem] pr-3 pb-[0.375rem] pl-3 flex justify-center items-center gap-4 outline-none border-none rounded-[0.375rem]"
      onClick={() => handleClick("/")}
    >
      <Image
        src="/assets/icons/google.svg"
        alt="Google Icon"
        width={20}
        height={20}
        className="w-4 h-auto"
      />{" "}
      Continue with Google
    </Button>
  );
};

export default GoogleBtn;
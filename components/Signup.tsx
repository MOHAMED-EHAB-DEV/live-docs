import Image from "next/image";
import Link from "next/link";
import { signIn } from 'next-auth/react';

import { Button } from "./ui/button";

const Signup = () => {
  return (
    <div className="box-border w-fit shadow-none">
      <div className="bg-[#060d18] p-5 rounded-xl">
        <div className="flex justify-center items-center flex-col p-5">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-8">
              <Link href="/">
                <Image
                  src="/assets/images/logo.png"
                  alt="Logo"
                  width={52}
                  height={52}
                />
              </Link>
              <div className="flex flex-col justify-center items-center gap-1">
                <h4 className="font-bold text-xl text-white">
                  Create your account
                </h4>
                <p className="text-base font-normal text-[#ffffffa6]">
                  Welcome! Please fill in the details to get started.
                </p>
              </div>
              <Button
                style={{
                  boxShadow:
                    "rgba(255, 255, 255, 0.07) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 2px 3px -1px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px",
                }}
                className="h-10 w-fit sm:w-[320px] font-medium text-base bg-[#3371ff] text-white pt-[0.375rem] pr-3 pb-[0.375rem] pl-3 flex justify-center items-center gap-4 outline-none border-none rounded-[0.375rem]"
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
            </div>
            <div
              className="bg-[#060d18] p-5"
            >
              <div className="flex justify-center items-center gap-1 py-4 px-8">
                <span className="text-[#ffffffa6] font-normal text-base">Already have an account?</span>
                <Link href="/sign-in" className="text-[#3374ff] font-medium text-base inline-flex items-center">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

"use client";

import Image from "next/image";
import Link from "next/link";

import GoogleBtn from "./GoogleBtn";

const Signin = () => {
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
                  Sign in to LiveDocs
                </h4>
                <p className="text-base font-normal text-[#ffffffa6]">
                  Welcome back! Please sign in to continue
                </p>
              </div>
              <GoogleBtn />
            </div>
            {/* <div className="bg-[#060d18] p-5">
              <div className="flex justify-center items-center gap-1 py-4 px-8">
                <span className="text-[#ffffffa6] font-normal text-base">
                  Don’t have an account?
                </span>
                <Link
                  href="/sign-up"
                  className="text-[#3374ff] font-medium text-base inline-flex items-center"
                >
                  Sign up
                </Link>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;

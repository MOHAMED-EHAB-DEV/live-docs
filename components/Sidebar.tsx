import React from "react";
import { Button } from "./ui/button";

const links = [
  {
    id: 0,
    name: "profile",
    text: "Profile",
    Icon: ({ Open }: { Open: String }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={Open === "profile" ? "#3374ff" : "#ffffff9e"}
        viewBox="0 0 16 16"
        width="24"
        height="24"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-2.585 2.894c.154.25.107.568-.083.792A5.675 5.675 0 0 1 8 13.688a5.675 5.675 0 0 1-4.332-2.002c-.19-.224-.237-.543-.083-.792.087-.14.189-.271.306-.392.46-.469 1.087-.986 1.703-1.102.514-.097.899.056 1.298.214.331.132.673.267 1.108.267.435 0 .777-.135 1.108-.267.4-.158.784-.31 1.298-.214.616.116 1.243.633 1.703 1.102.117.12.22.252.306.392ZM8 8.919c1.329 0 2.406-1.559 2.406-2.888a2.406 2.406 0 1 0-4.812 0C5.594 7.361 6.67 8.92 8 8.92Z"
        ></path>
      </svg>
    ),
    onClick: (
      name: string,
      setName: React.Dispatch<React.SetStateAction<string>>
    ) => {
      setName(name);
    },
  },
  {
    id: 1,
    name: "security",
    text: "Security",
    Icon: ({ Open }: { Open: String }) => (
      <svg
        fill={Open === "security" ? "#3374ff" : "#ffffff9e"}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width="24"
        height="24"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.748 2.91a.48.48 0 0 1 .124.083c.088.082.14.193.126.31v4.054a7.58 7.58 0 0 1-1.227 4.147c-.99 1.52-3.778 3.038-4.563 3.445a.45.45 0 0 1-.416 0c-.785-.407-3.576-1.925-4.565-3.445A7.61 7.61 0 0 1 2 7.357V3.303a.43.43 0 0 1 .14-.31.484.484 0 0 1 .334-.13h.027c2.162 0 4.132-.655 5.148-1.714A.485.485 0 0 1 8.004 1c.137 0 .266.054.355.149 1.016 1.056 2.99 1.714 5.148 1.714h.027c.076 0 .149.016.214.046Zm-2.695 3.097a.75.75 0 0 0-1.106-1.014c-.9.983-1.363 1.624-2.013 2.787-.218.39-.442.876-.626 1.305l-1.242-1.43a.75.75 0 0 0-1.132.982l2.042 2.354a.75.75 0 0 0 1.269-.227v-.003l.005-.011.018-.046a22.354 22.354 0 0 1 .305-.762c.199-.474.447-1.03.67-1.43.594-1.062.988-1.608 1.81-2.505Z"
        ></path>
      </svg>
    ),
    onClick: (
      name: string,
      setName: React.Dispatch<React.SetStateAction<string>>
    ) => {
      setName(name);
    },
  },
];

type SidebarProps = {
  Open: String;
  setOpen: React.Dispatch<React.SetStateAction<string>>;
};

const Sidebar: React.FC<SidebarProps> = ({ Open, setOpen }) => {
  return (
    <div
      className="sm:w-52 w-full items-center justify-center sm:items-start h-1/4 sm:h-full sm:justify-start sm:rounded-s-md rounded-l-md pt-6 pr-5 pb-4 pl-3 sm:pl-4 flex flex-col gap-6"
      style={{
        background:
          "linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), linear-gradient(rgb(31, 31, 35), rgb(31, 31, 35))",
      }}
    >
      <div className="flex flex-col gap-[0.125rem]">
        <h3 className="text-white text-3xl font-semibold m-0">Account</h3>
        <p className="text-[#ffffffa6] font-normal text-base m-0 hidden sm:block">
          Manage your account info.
        </p>
      </div>
      <div className="flex flex-row sm:flex-col gap-1 items-center justify-center">
        {links.map(({ name, text, Icon, id, onClick }) => (
          <Button
            onClick={() => onClick(name, setOpen)}
            className={`flex gap-3 py-[0.375rem] px-3 sm:w-44 w-36 text-[#ffffff9e] bg-transparent text-base font-medium items-center justify-center sm:justify-start outline-none border-none rounded-[0.375rem] hover:bg-[#ffffff05] ${
              Open === name &&
              "text-[#3374ff] bg-[#ffffff12] hover:bg-[#ffffff12]"
            }`}
            key={id}
          >
            <Icon Open={Open} />
            {text}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

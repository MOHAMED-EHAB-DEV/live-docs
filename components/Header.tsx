import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

const Header = ({ children, className } : HeaderProps) => {
  return (
    <div className={cn("header", className)}>
      <Link href="/">
        <Image
          src="/assets/icons/logo.svg"
          alt="logo with name"
          width={120}
          height={32}
          className="hidden md:block w-auto h-auto"
          priority
        />
        <Image
          src="/assets/icons/logo-icon.svg"
          alt="logo without name"
          width={32}
          height={32}
          className="me-2 md:hidden w-auto h-auto"
          priority
        />
      </Link>

      {children}
    </div>
  );
};

export default Header;

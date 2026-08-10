"use client";

import { Dispatch, SetStateAction } from "react";

import { Input } from "./ui/Input";

const Search = ({ search, setSearch, className } : { search: string, setSearch: Dispatch<SetStateAction<string>>, className?: string }) => {
  return (
    <Input
      type="text"
      placeholder="Search documents..."
      value={search}
      onChange={(e) => setSearch(e.target.value as string)}
      leftIcon={
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      }
      className={className || "w-full"}
    />
  );
};

export default Search;

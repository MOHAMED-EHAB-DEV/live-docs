"use client";

import { Dispatch, SetStateAction } from "react";

import { Input } from "./ui/input";

const Search = ({ search, setSearch } : { search: string, setSearch: Dispatch<SetStateAction<string>> }) => {
  return (
    <Input
      type="text"
      placeholder="Search documents..."
      value={search}
      onChange={(e) => setSearch(e.target.value as string)}
      className={`max-w-80 w-max bg-transparent border-none outline-none focus:ring-transparent ring-offset-transparent focus-visible:ring-transparent`}
    />
  );
};

export default Search;

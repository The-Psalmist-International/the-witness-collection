"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type AdminSearchBarProps = {
  placeholder?: string;
  paramName?: string;
};

export function AdminSearchBar({
  placeholder = "Search orders…",
  paramName = "q",
}: AdminSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");

  useEffect(() => {
    setValue(searchParams.get(paramName) ?? "");
  }, [paramName, searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      params.set(paramName, trimmed);
    } else {
      params.delete(paramName);
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `?${query}` : "?");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="h-10 flex-1 rounded-md border border-neutral-200 px-3 text-sm outline-none transition-colors focus:border-black"
      />
      <button
        type="submit"
        className="h-10 rounded-md bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Search
      </button>
    </form>
  );
}

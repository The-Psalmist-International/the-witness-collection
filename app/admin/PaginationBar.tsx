import Link from "next/link";

type PaginationBarProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

export function PaginationBar({
  basePath,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: PaginationBarProps) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
  );

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-500">
        Showing {start}-{end} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <PaginationLink
          href={buildPageHref(basePath, currentPage - 1)}
          disabled={currentPage <= 1}
          label="Previous"
        />

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showEllipsis = previousPage && page - previousPage > 1;

          return (
            <span key={page} className="flex items-center gap-2">
              {showEllipsis && (
                <span className="px-1 text-sm text-neutral-400">...</span>
              )}
              <PaginationLink
                href={buildPageHref(basePath, page)}
                disabled={false}
                label={String(page)}
                active={page === currentPage}
              />
            </span>
          );
        })}

        <PaginationLink
          href={buildPageHref(basePath, currentPage + 1)}
          disabled={currentPage >= totalPages}
          label="Next"
        />
      </div>
    </div>
  );
}

function buildPageHref(basePath: string, page: number) {
  if (page < 1) {
    return basePath;
  }

  return `${basePath}?page=${page}`;
}

function PaginationLink({
  href,
  disabled,
  label,
  active = false,
}: {
  href: string;
  disabled: boolean;
  label: string;
  active?: boolean;
}) {
  if (disabled) {
    return (
      <span className="rounded-full border border-neutral-100 px-3 py-1.5 text-sm text-neutral-300">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-purple-950 bg-purple-950 text-white"
          : "border-neutral-200 text-black hover:border-purple-950 hover:text-purple-950"
      }`}
    >
      {label}
    </Link>
  );
}

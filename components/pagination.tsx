import Link from "next/link";
import { inventoryHref, pageWindow, type InventoryQuery } from "@/lib/inventory/filter";

export function Pagination({
  query,
  page,
  pageCount,
}: {
  query: InventoryQuery;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const linkClass = "inline-flex h-11 min-w-11 items-center justify-center border border-white/20 px-3 text-sm";
  return (
    <nav aria-label="Inventory pages" className="mt-10 flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link className={linkClass} href={`${inventoryHref(query, { page: page - 1 })}#results`}>
          Previous
        </Link>
      ) : (
        <span className={`${linkClass} opacity-40`}>Previous</span>
      )}
      {pageWindow(page, pageCount).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-[#c9c3b6]">
            …
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page" className={`${linkClass} bg-[#f6f4ef] text-[#1c1b18]`}>
            {item}
          </span>
        ) : (
          <Link key={item} className={linkClass} href={`${inventoryHref(query, { page: item })}#results`}>
            {item}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link className={linkClass} href={`${inventoryHref(query, { page: page + 1 })}#results`}>
          Next
        </Link>
      ) : (
        <span className={`${linkClass} opacity-40`}>Next</span>
      )}
    </nav>
  );
}

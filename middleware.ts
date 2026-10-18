import { NextResponse, type NextRequest } from "next/server";
import redirects from "./redirects/cutover.map.json";

type RedirectEntry = { source: string; destination: string; permanent: boolean };

const destinations = new Map<string, string>(
  (redirects as RedirectEntry[]).map((entry) => [entry.source, entry.destination]),
);

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/_next") || path.startsWith("/api") || path.startsWith("/feeds")) {
    return NextResponse.next();
  }
  let destination = destinations.get(path);
  if (!destination) {
    try {
      destination = destinations.get(decodeURIComponent(path));
    } catch {
      destination = undefined;
    }
  }
  if (!destination) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = destination;
  url.search = "";
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};

import { handleLeadRequest } from "@/lib/leads/deliver";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleLeadRequest(request);
}

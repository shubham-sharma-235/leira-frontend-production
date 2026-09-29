import { NextResponse } from "next/server";
import { fetchPincodeFromPostalApi } from "@/lib/address/lookup-pincode";

type Ctx = { params: Promise<{ pin: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { pin } = await context.params;
  const clean = String(pin || "").replace(/\D/g, "");
  if (clean.length !== 6) {
    return NextResponse.json({ ok: false, error: "invalid_pin" }, { status: 400 });
  }

  try {
    const parsed = await fetchPincodeFromPostalApi(clean);
    if (!parsed) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, pincode: clean, state: parsed.state, city: parsed.city });
  } catch {
    return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
  }
}

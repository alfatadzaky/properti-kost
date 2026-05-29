import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateTransactionStatus } from "@/lib/data";

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const transactionId = Number(body.transactionId);

    if (!Number.isFinite(transactionId) || transactionId <= 0) {
      return NextResponse.json({ error: "Invalid transaction ID." }, { status: 400 });
    }

    await updateTransactionStatus(transactionId, "Released to owner");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to confirm admin transaction", {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: "Failed to confirm transaction." },
      { status: 500 }
    );
  }
}

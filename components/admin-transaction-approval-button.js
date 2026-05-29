"use client";

import { useState } from "react";
import { confirmOccupied } from "@/lib/contract";

export default function AdminTransactionApprovalButton({ transactionId }) {
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleApprove() {
    try {
      setIsSubmitting(true);
      setStatusMessage("Connecting MetaMask to confirm escrow release...");

      const txHash = await confirmOccupied();
      setStatusMessage("On-chain approval succeeded. Updating transaction record...");

      const response = await fetch("/api/admin/transactions/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transactionId,
          txHash
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save approval status.");
      }

      setStatusMessage("Admin approval completed. Reloading transaction list...");
      window.location.reload();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to approve transaction.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isSubmitting}
        className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[var(--primary-disabled)] hover:-translate-y-0.5 hover:bg-[var(--primary-active)]"
      >
        {isSubmitting ? "Approving..." : "Approve"
        }
      </button>
      <p className="text-xs text-[var(--muted)]">
        Use the owner wallet in MetaMask to confirm escrow release. The contract requires the property owner account to call confirmOccupied().
      </p>
      {statusMessage ? <p className="text-sm text-[var(--body)]">{statusMessage}</p> : null}
    </div>
  );
}

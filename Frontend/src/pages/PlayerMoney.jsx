import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Check, CircleAlert, Plus, ReceiptText, X } from "lucide-react";
import api from "../lib/axios";

const currency = (value) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value) || 0)}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function PlayerMoney() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlayerMoney = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/money/players/${playerId}`);
      setPlayer(response.data.player);
      setLedger(response.data.ledger);
      setCurrentBalance(response.data.currentBalance);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load player data.",
      );
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayerMoney();
  }, [fetchPlayerMoney]);

  const handleAddMoney = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      await api.post(`/money/players/${playerId}/add`, {
        amount: Number(amount),
      });
      setAmount("");
      setShowAddMoney(false);
      await fetchPlayerMoney();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not add money.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      await api.post(`/money/players/${playerId}/pay`, {
        amount: Number(amount),
      });
      setAmount("");
      setShowPayment(false);
      await fetchPlayerMoney();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not record payment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openForm = (type) => {
    setAmount("");
    setError("");
    setShowAddMoney(type === "add");
    setShowPayment(type === "payment");
  };

  const activeForm = showAddMoney ? "add" : showPayment ? "payment" : null;
  const records = [...ledger].reverse();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border/70 bg-background/95">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/owner"
            className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Back to owner dashboard"
          >
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-lg font-bold sm:text-xl">
                Backstage Snooker Club <span className="text-gold">&amp;</span>{" "}
                Café
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] pt-1 text-muted-foreground">
                Owner dashboard
              </span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-9 sm:px-6 sm:pt-14 lg:px-8">
        <div className="border-b border-border pb-7 sm:pb-9">
          <h1 className="mt-3 wrap-break-words font-display text-4xl font-bold leading-tight sm:text-5xl">
            {player?.username ? (
              <>
                {player.username.charAt(0).toUpperCase() +
                  player.username.slice(1)}
                .
              </>
            ) : (
              <>
                Money <span className="text-gold">ledger.</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Balance &amp; payment history
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            aria-label="Loading player money"
            className="mt-8 space-y-4"
          >
            <div className="h-52 animate-pulse rounded-lg bg-surface" />
            <div className="h-12 w-48 animate-pulse rounded-lg bg-surface" />
            <div className="h-40 animate-pulse rounded-lg bg-surface" />
            <span className="sr-only">Loading player money...</span>
          </div>
        ) : !player ? (
          <div className="py-5">
            <p className="text-muted-foreground">Player account unavailable.</p>
            <button
              type="button"
              onClick={fetchPlayerMoney}
              className="mt-2 border-border text-foreground hover:border-gold/50 hover:bg-surface"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <section
              aria-label="Current balance"
              className="mt-8 rounded-lg border border-border bg-surface p-5 sm:p-7"
            >
              {/* Balance header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Current balance
                  </p>

                  <p className="mt-3 text-4xl font-bold tracking-tight text-orange-300 sm:text-5xl">
                    {currency(currentBalance)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => openForm("add")}
                  aria-expanded={showAddMoney}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-emerald-accent/30 bg-emerald-accent/10 font-semibold text-emerald-accent transition-colors hover:border-emerald-accent/50 hover:bg-emerald-accent/15"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add
                </button>

                <button
                  type="button"
                  disabled={currentBalance <= 0}
                  onClick={() => openForm("payment")}
                  aria-expanded={showPayment}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent font-semibold text-muted-foreground transition-colors hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
                >
                  <Check className="size-4" aria-hidden="true" />
                  Paid
                </button>
              </div>
            </section>

            {activeForm && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    openForm(null);
                  }
                }}
              >
                <form
                  onSubmit={
                    activeForm === "add" ? handleAddMoney : handlePayment
                  }
                  className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-7"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="mt-1 font-display text-2xl font-bold">
                        {activeForm === "add" ? "Add money" : "Record payment"}
                      </h2>
                    </div>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => openForm(null)}
                      aria-label="Close form"
                      className="flex size-10 shrink-0 items-center justify-center  text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="size-8" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="money-amount"
                      className="mb-2 block text-sm font-medium text-muted-foreground"
                    >
                      Amount
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-accent/80">
                        ₹
                      </span>

                      <input
                        id="money-amount"
                        type="number"
                        min="1"
                        step="1"
                        max={
                          activeForm === "payment" ? currentBalance : undefined
                        }
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        required
                        inputMode="numeric"
                        placeholder={
                          activeForm === "payment"
                            ? `Up to ${currentBalance}`
                            : "Enter amount"
                        }
                        className="h-12 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-foreground outline-none transition-colors placeholder:text-muted-foreground "
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="mt-6 h-12 w-full rounded-lg border border-sky-400/20 bg-sky-400/10 font-semibold text-sky-300 transition-colors hover:border-sky-400/40 hover:bg-sky-400/15"
                  >
                    {actionLoading
                      ? "Saving..."
                      : activeForm === "add"
                        ? "Add"
                        : "Paid"}
                  </button>
                </form>
              </div>
            )}

            <section className="mt-5" aria-labelledby="ledger-heading">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <h2
                    id="ledger-heading"
                    className="mt-2 ml-0.5 font-display text-2xl font-bold sm:text-3xl"
                  >
                    Money ledger
                  </h2>
                </div>
              </div>
              {ledger.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface/40 px-5 py-12 text-center">
                  <ReceiptText
                    className="mx-auto size-8 text-emerald-accent"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-display text-xl font-bold">
                    No money records yet
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    New entries will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border bg-surface">
                  <table className="w-full table-fixed text-[11px] sm:text-sm">
                    <thead className="border-b border-border bg-surface-2/50 text-[10px] uppercase text-muted-foreground sm:text-xs">
                      <tr>
                        <th
                          scope="col"
                          className="w-[28%] px-2 py-3 text-center font-medium sm:px-4 sm:py-4"
                        >
                          Date
                        </th>

                        <th
                          scope="col"
                          className="w-[22%] px-1 py-3 text-center font-medium sm:px-4 sm:py-4"
                        >
                          Added
                        </th>

                        <th
                          scope="col"
                          className="w-[22%] px-1 py-3 text-center font-medium sm:px-4 sm:py-4"
                        >
                          Paid
                        </th>

                        <th
                          scope="col"
                          className="w-[28%] px-2 py-3 text-center font-medium sm:px-4 sm:py-4"
                        >
                          Balance
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {records.map((record) => (
                        <tr
                          key={record.id}
                          className="transition-colors hover:bg-surface-2/40"
                        >
                          <td className="whitespace-nowrap px-2 py-3 text-center text-foreground sm:px-4 sm:py-4">
                            {formatDate(record.date)}
                          </td>

                          <td className="whitespace-nowrap px-1 py-3 text-center text-emerald-accent sm:px-4 sm:py-4">
                            {record.added > 0 ? currency(record.added) : "—"}
                          </td>

                          <td className="whitespace-nowrap px-1 py-3 text-center text-gold sm:px-4 sm:py-4">
                            {record.paid > 0 ? currency(record.paid) : "—"}
                          </td>

                          <td className="whitespace-nowrap px-2 py-3 text-center text-foreground sm:px-4 sm:py-4">
                            {currency(record.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default PlayerMoney;

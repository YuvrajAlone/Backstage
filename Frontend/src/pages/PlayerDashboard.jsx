import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { Link } from "react-router";

const currency = (value) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value) || 0)}`;

function PlayerDashboard() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [ledger, setLedger] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyMoney = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/money/my-money");

        setLedger(response.data.ledger);
        setCurrentBalance(response.data.currentBalance);
      } catch (error) {
        setError(
          error.response?.data?.message || "Could not load your money details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyMoney();
  }, []);

  const formatDate = (value) => {
    return new Date(value).toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayedLedger = [...ledger].reverse();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
        {/* Header */}
        <header className=" bg-background/95 ">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0 leading-tight">
                <Link to="/">
                  <p className="truncate font-display text-base font-bold sm:text-xl">
                    Backstage Snooker Club{" "}
                    <span className="text-gold">&amp;</span> Café
                  </p>
                </Link>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
                  Player dashboard
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              aria-label="Log out"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-3 text-sm font-medium text-foreground transition-colors hover:border-gold/50 hover:bg-surface hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:h-10 sm:px-4"
            >
              <LogOut className="size-5 pl-1" aria-hidden="true" />

              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* Welcome */}
        <section className="mt-5">
          <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:mt-4 sm:text-5xl">
            Welcome
            <span className="text-gold/70">
              {user?.username
                ? ` ${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`
                : ""}
              .
            </span>
          </h1>
        </section>

        {/* Current Balance */}
        <section className="mt-7 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <p className="text-sm text-zinc-500">Amount Due</p>

          <p className="mt-2 text-4xl text-orange-300 font-semibold tracking-tight">
            ₹{currentBalance}
          </p>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Ledger */}
        <section className="mt-9">
          <div className="mb-4">
            <h2 className="mt-1 text-xl font-display">Money Ledger</h2>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-500">
              Loading your ledger...
            </div>
          ) : ledger.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-7 text-center">
              <p className="text-zinc-400">No money records yet.</p>

              <p className="mt-1 text-sm text-zinc-600">
                Your payment history will appear here.
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
                  {displayedLedger.map((record) => (
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
      </div>
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="mb-5">
              <div className="mb-3 flex size-10 pl-1 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                <LogOut className="size-5 " />
              </div>

              <h2 className="text-lg font-semibold text-foreground">
                Log out?
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Are you sure you want to log out?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-brass/70 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#d9b45f]"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerDashboard;

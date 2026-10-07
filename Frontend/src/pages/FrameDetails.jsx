import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CalendarDays, Check, CircleAlert, Clock3, Users } from "lucide-react";
import api from "../lib/axios";

function FrameDetails() {
  const { frameId } = useParams();
  const navigate = useNavigate();

  const [frame, setFrame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedUnpaidPlayers, setSelectedUnpaidPlayers] = useState([]);

  const fetchFrame = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/frames/${frameId}`);
      setFrame(response.data.frame);
    } catch (error) {
      setError(error.response?.data?.message || "Could not load frame.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrame();
  }, [frameId]);

  const handleUnpaid = (playerId) => {
    setSelectedUnpaidPlayers((current) => {
      if (current.includes(playerId)) {
        setError("");

        return current.filter((id) => id !== playerId);
      }

      const maxUnpaidPlayers = frame.gameType === "1/1" ? 1 : 2;

      if (current.length >= maxUnpaidPlayers) {
        setError(
          frame.gameType === "1/1"
            ? "Only one player can be unpaid in a 1/1 frame."
            : "Only two players can be unpaid in a 2/2 frame.",
        );

        return current;
      }

      setError("");

      return [...current, playerId];
    });
  };

  const handlePaid = (playerId) => {
    setSelectedUnpaidPlayers((current) =>
      current.filter((id) => id !== playerId),
    );
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      setError("");

      // Submit unpaid players
      for (const playerId of selectedUnpaidPlayers) {
        await api.post(`/money/frames/${frameId}/unpaid`, {
          playerId,
        });
      }

      // Complete frame
      await api.patch(`/frames/${frameId}/complete`);

      navigate("/owner");
    } catch (error) {
      setError(error.response?.data?.message || "Could not complete frame.");
    } finally {
      setActionLoading(false);
    }
  };

  const players = frame?.players ?? [];

  const frameDate = frame
    ? new Date(frame.playedAt).toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const isOngoing = frame?.status === "ongoing";

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/owner"
            className="flex min-w-0 items-center gap-3"
            aria-label="Back to owner dashboard"
          >
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-lg font-bold sm:text-xl">
                Backstage Snooker Club <span className="text-gold">&amp;</span>{" "}
                Café
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Owner dashboard
              </span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-5 sm:px-6 sm:pt-14 lg:px-8">
        <div className="border-b border-border pb-2 sm:pb-2">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Frame <span className="text-gold">Details.</span>
          </h1>
        </div>

        {loading ? (
          <div
            className="mt-10 space-y-4"
            aria-label="Loading frame"
            role="status"
          >
            <div className="h-20 max-w-lg animate-pulse rounded-lg bg-surface" />
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg bg-surface"
              />
            ))}
            <span className="sr-only">Loading frame...</span>
          </div>
        ) : !frame ? (
          <div
            className="mt-12 border-l-2 border-destructive pl-5"
            role="alert"
          >
            <CircleAlert
              className="size-6 text-destructive"
              aria-hidden="true"
            />
            <h2 className="mt-3 font-display text-2xl font-bold">
              Frame unavailable
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || "Could not load frame."}
            </p>
            <button
              variant="outline"
              onClick={fetchFrame}
              className="mt-6 border-border text-foreground hover:border-gold/50 hover:text-gold"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(230px,280px)] lg:gap-16">
            <section aria-labelledby="players-heading" className="min-w-0">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2
                    id="players-heading"
                    className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                  >
                    Players &amp; Payments
                  </h2>
                </div>
                <span className="flex items-center mb-1 gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" aria-hidden="true" />{" "}
                  {players.length} players
                </span>
              </div>

              <div className="space-y-2">
                {players.map((player, index) => {
                  const unpaid = isOngoing
                    ? selectedUnpaidPlayers.includes(player.id)
                    : player.paymentStatus === "unpaid";

                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
                    >
                      {/* Player */}
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-800/40 font-mono text-xs font-medium text-zinc-400"
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <p className="min-w-0 truncate font-semibold text-foreground">
                          {player.username.charAt(0).toUpperCase() +
                            player.username.slice(1)}
                        </p>
                      </div>

                      {/* Payment */}
                      <div className="flex shrink-0 items-center gap-2">
                        {isOngoing ? (
                          <>
                            {/* Paid */}
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handlePaid(player.id)}
                              className={`inline-flex w-19.5 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                !unpaid
                                  ? "border-emerald-accent/20 bg-emerald-accent/10 text-emerald-accent"
                                  : "border-emerald-accent/20 bg-transparent text-emerald-accent hover:bg-emerald-accent/5"
                              }`}
                            >
                              <span className="size-1.5 rounded-full bg-emerald-accent" />
                              Paid
                            </button>

                            {/* Unpaid */}
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleUnpaid(player.id)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                unpaid
                                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                                  : "border-red-500/20 bg-transparent text-red-400 hover:bg-red-500/5"
                              }`}
                            >
                              <span className="size-1.5 rounded-full bg-red-400" />
                              Unpaid
                            </button>
                          </>
                        ) : unpaid ? (
                          /* Completed → Unpaid only */
                          <span className="inline-flex w-19.5 items-center justify-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                            <span className="size-1.5 rounded-full bg-red-400" />
                            Unpaid
                          </span>
                        ) : (
                          /* Completed → Paid only */
                          <span className="inline-flex w-19.5 items-center justify-center gap-1.5 rounded-full border border-emerald-accent/20 bg-emerald-accent/10 px-2.5 py-1 text-xs font-medium text-emerald-accent">
                            <span className="size-1.5 rounded-full bg-emerald-accent" />
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 flex items-center gap-2 text-sm text-destructive"
                >
                  <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}

              {isOngoing && (
                <div className="mt-8 border-t border-border pt-7">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleComplete}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-accent/30 bg-emerald-accent/10 px-6 text-sm font-semibold text-emerald-accent transition-colors hover:border-emerald-accent/50 hover:bg-emerald-accent/15 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    <Check className="size-4" aria-hidden="true" />
                    {actionLoading ? "Saving..." : "Done"}
                  </button>
                </div>
              )}
            </section>

            <aside aria-label="Frame information">
              <dl className="mt-6 border-y border-border">
                <div className="flex items-start justify-between gap-4 p-5">
                  {/* Date */}
                  <div>
                    <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      <CalendarDays className="size-4" aria-hidden="true" />
                      Date played
                    </dt>

                    <dd className="mt-2 font-serif text-xl font-bold">
                      {frameDate}
                    </dd>
                  </div>

                  {/* Status */}
                  <div>
                    <dd
                      className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium capitalize ${
                        frame.status === "completed"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          frame.status === "completed"
                            ? "bg-green-600"
                            : "bg-red-500"
                        }`}
                      />
                      {frame.status}
                    </dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default FrameDetails;

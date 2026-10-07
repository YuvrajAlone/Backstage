import { useCallback, useEffect, useState } from "react";
import { CalendarDays, LogOut, Plus, Target, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import AddFrame from "../components/AddFrame";
import { Link } from "react-router";

function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [frames, setFrames] = useState([]);

  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingFrames, setLoadingFrames] = useState(true);

  const [showAddFrame, setShowAddFrame] = useState(false);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoadingPlayers(true);

      const response = await api.get("/users/players");

      setPlayers(response.data.players);
    } catch (error) {
      console.error("Could not fetch players:", error);
    } finally {
      setLoadingPlayers(false);
    }
  }, []);

  const fetchFrames = useCallback(async () => {
    try {
      setLoadingFrames(true);

      const response = await api.get("/frames");

      setFrames(response.data.frames);
    } catch (error) {
      console.error("Could not fetch frames:", error);
    } finally {
      setLoadingFrames(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchFrames();
  }, [fetchPlayers, fetchFrames]);

  const handleFrameCreated = () => {
    fetchFrames();
  };

  const activeFrames = frames.filter((frame) => frame.status === "ongoing");

  const recentFrames = frames
    .filter((frame) => frame.status === "completed")
    .slice(0, 100);

  const formatDate = (value) => {
    return new Date(value).toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <header className=" bg-background/95">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0 leading-tight">
              <Link to="/">
                <p className="truncate font-display text-base font-bold sm:text-xl">
                  Backstage Snooker Club{" "}
                  <span className="text-gold">&amp;</span> Café
                </p>
              </Link>

              <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
                Owner dashboard
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

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden ">
          <img
            src="/club-interior.jpg"
            alt="Snooker tables at the club"
            className="absolute inset-0 size-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-linear-to-r from-background via-background/65 to-background/10" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/85 to-transparent" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-end px-4 py-10 sm:min-h-80 sm:justify-center sm:px-6 sm:py-12 lg:px-8">
            <h1 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:mt-4 sm:text-5xl">
              Welcome
              <span className="text-gold/70">
                {user?.username
                  ? ` ${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`
                  : ""}
                .
              </span>
            </h1>

            <p className="mt-1 max-w-md text-sm leading-6 text-foreground/75 sm:mt-4 sm:text-base">
              Your players, frames, and payments — all in one place.
            </p>
          </div>
        </section>

        {/* Dashboard content */}
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
          {/* Active Frames */}
          <section aria-labelledby="active-frames-heading">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-5 sm:mb-6">
              <div className="min-w-0">
                <h2
                  id="active-frames-heading"
                  className="mt-1.5 whitespace-nowrap font-display text-2xl font-bold sm:mt-2 sm:text-4xl"
                >
                  Active Frames
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAddFrame(true)}
                className="inline-flex size-8 shrink-0 translate-y-1 items-center justify-center rounded-lg border border-gold/40 bg-gold/5 text-gold transition-colors hover:border-gold/70 hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-gold/30 sm:h-10 sm:w-auto sm:translate-y-0 sm:gap-2 sm:rounded-full sm:px-4"
              >
                <Plus className="size-3.5 sm:size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Add Frame</span>
              </button>
            </div>

            {loadingFrames ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-surface sm:rounded-lg"
                  />
                ))}
              </div>
            ) : activeFrames.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center sm:rounded-lg sm:px-6 sm:py-12">
                <Target
                  className="mx-auto size-8 text-[#4F8A70]"
                  aria-hidden="true"
                />

                <p className="mt-4 font-display text-xl font-bold">
                  No active frames
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Your frames will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface sm:rounded-lg">
                {activeFrames.map((frame) => {
                  const playersInFrame = [
                    frame.player1,
                    frame.player2,
                    frame.player3,
                    frame.player4,
                  ].filter(Boolean);

                  const frameDate = formatDate(frame.played_at);

                  return (
                    <Link
                      key={frame.id}
                      to={`/owner/frames/${frame.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#4F8A70]/30 bg-[#4F8A70]/8 text-[#4F8A70]">
                          <Target className="size-4" aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground sm:text-base">
                            {playersInFrame.length === 4 ? (
                              <>
                                <span>
                                  {playersInFrame[0].charAt(0).toUpperCase() +
                                    playersInFrame[0].slice(1)}
                                  {" / "}
                                  {playersInFrame[1].charAt(0).toUpperCase() +
                                    playersInFrame[1].slice(1)}
                                </span>

                                <span className="text-xs font-normal text-muted-foreground">
                                  vs
                                </span>

                                <span>
                                  {playersInFrame[2].charAt(0).toUpperCase() +
                                    playersInFrame[2].slice(1)}
                                  {" / "}
                                  {playersInFrame[3].charAt(0).toUpperCase() +
                                    playersInFrame[3].slice(1)}
                                </span>
                              </>
                            ) : (
                              playersInFrame.map((player, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-2"
                                >
                                  {i > 0 && (
                                    <span className="text-xs font-normal text-muted-foreground">
                                      vs
                                    </span>
                                  )}

                                  <span className="wrap-break-word">
                                    {player.charAt(0).toUpperCase() +
                                      player.slice(1)}
                                  </span>
                                </span>
                              ))
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                            <CalendarDays
                              className="size-4 shrink-0 text-emerald-accent/50"
                              aria-hidden="true"
                            />

                            <span>{frameDate}</span>
                          </div>
                        </div>
                        <div className="ml-auto flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-500">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          Live
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Frames */}
          <section
            className="mt-12 sm:mt-16 pb-5"
            aria-labelledby="recent-frames-heading"
          >
            <div className="mb-5 border-b border-border pb-5 sm:mb-6">
              <h2
                id="recent-frames-heading"
                className="mt-1.5 whitespace-nowrap font-display text-2xl font-bold sm:mt-2 sm:text-4xl"
              >
                Recent Frames
              </h2>
            </div>

            {loadingFrames ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-surface sm:rounded-lg"
                  />
                ))}
              </div>
            ) : recentFrames.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface/40 px-5 py-10 text-center sm:rounded-lg sm:px-6 sm:py-12">
                <Target
                  className="mx-auto size-8 text-[#4F8A70]"
                  aria-hidden="true"
                />

                <p className="mt-4 font-display text-xl font-bold">
                  No recent frames
                </p>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Your frames will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface sm:rounded-lg">
                {recentFrames.map((frame) => {
                  const playersInFrame = [
                    frame.player1,
                    frame.player2,
                    frame.player3,
                    frame.player4,
                  ].filter(Boolean);

                  const frameDate = formatDate(frame.played_at);

                  return (
                    <Link
                      key={frame.id}
                      to={`/owner/frames/${frame.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#4F8A70]/30 bg-[#4F8A70]/8 text-[#4F8A70]">
                          <Target className="size-4" aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-foreground sm:text-base">
                            {playersInFrame.length === 4 ? (
                              <>
                                <span>
                                  {playersInFrame[0].charAt(0).toUpperCase() +
                                    playersInFrame[0].slice(1)}
                                  {" / "}
                                  {playersInFrame[1].charAt(0).toUpperCase() +
                                    playersInFrame[1].slice(1)}
                                </span>

                                <span className="text-xs font-normal text-muted-foreground">
                                  vs
                                </span>

                                <span>
                                  {playersInFrame[2].charAt(0).toUpperCase() +
                                    playersInFrame[2].slice(1)}
                                  {" / "}
                                  {playersInFrame[3].charAt(0).toUpperCase() +
                                    playersInFrame[3].slice(1)}
                                </span>
                              </>
                            ) : (
                              playersInFrame.map((player, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-2"
                                >
                                  {i > 0 && (
                                    <span className="text-xs font-normal text-muted-foreground">
                                      vs
                                    </span>
                                  )}

                                  <span className="wrap-break-word">
                                    {player.charAt(0).toUpperCase() +
                                      player.slice(1)}
                                  </span>
                                </span>
                              ))
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                            <CalendarDays
                              className="size-4 shrink-0 text-emerald-accent/50"
                              aria-hidden="true"
                            />

                            <span className="pt-0.5">{frameDate}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-2">
          <span className="flex min-h-14 items-center justify-center text-sm font-medium text-gold">
            Frames
          </span>

          <Link
            to="/owner/players"
            className="flex min-h-14 items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Players
          </Link>
        </div>
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
      {showAddFrame && (
        <AddFrame
          players={players}
          onClose={() => setShowAddFrame(false)}
          onFrameCreated={handleFrameCreated}
        />
      )}
    </div>
  );
}

export default OwnerDashboard;

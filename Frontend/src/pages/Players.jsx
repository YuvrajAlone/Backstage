import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import api from "../lib/axios";
import { ArrowRight, Search, Users, X } from "lucide-react";

function Players() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);

        const response = await api.get("/users/players");

        setPlayers(response.data.players);
      } catch (error) {
        setError(error.response?.data?.message || "Could not load players.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return players;
    }

    return players.filter((player) =>
      player.username.toLowerCase().includes(query),
    );
  }, [players, search]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border/70 bg-background/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/owner">
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold sm:text-xl">
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

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-5 sm:px-6 sm:pt-2 lg:px-8">
        <div className="border-b border-border pb-5 sm:pb-9">
          <div className="relative sm:mt-9">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/70"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search players"
              aria-label="Search players"
              className="h-10 w-full rounded-4xl border border-border bg-surface pl-12 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/20 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <section className="mt-2" aria-label="Player list">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              All players
            </h2>
            {!loading && !error && (
              <span className="text-xs text-muted-foreground pt-2">
                {filteredPlayers.length}{" "}
                {filteredPlayers.length === 1 ? "player" : "players"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-2" aria-label="Loading players">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-18 animate-pulse rounded-lg bg-surface"
                />
              ))}
              <span className="sr-only">Loading players...</span>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/35 bg-destructive/10 px-5 py-6 text-sm text-destructive"
            >
              {error}
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface/40 px-5 py-12 text-center">
              <Users
                className="mx-auto size-8 text-emerald-accent"
                aria-hidden="true"
              />
              <p className="mt-4 font-display text-xl font-bold">
                {search.trim() ? "No matches found" : "No players yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {search.trim()
                  ? "Try a different name."
                  : "Registered players will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {filteredPlayers.map((player) => (
                <Link
                  key={player.id}
                  to={`/owner/players/${player.id}`}
                  className="group flex min-h-18 items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none sm:px-5"
                >
                  <span
                    className="h-5 w-0.5 shrink-0 rounded-full bg-emerald-accent/60"
                    aria-hidden="true"
                  ></span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {player.username.charAt(0).toUpperCase() +
                      player.username.slice(1)}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-gold"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-2">
          <Link
            to="/owner"
            className="flex min-h-14 items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Frames
          </Link>

          <span className="flex min-h-14 items-center justify-center text-sm font-medium text-gold">
            Players
          </span>
        </div>
      </div>
    </div>
  );
}

export default Players;

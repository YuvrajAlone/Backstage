import { useEffect, useState } from "react";
import api from "../lib/axios";

function AddFrame({ players, onClose, onFrameCreated }) {
  const [gameType, setGameType] = useState("1/1");

  const [selectedPlayers, setSelectedPlayers] = useState({
    player1: "",
    player2: "",
    player3: "",
    player4: "",
  });

  const [playerSearch, setPlayerSearch] = useState({
    player1: "",
    player2: "",
    player3: "",
    player4: "",
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const requiredPlayers =
    gameType === "1/1"
      ? ["player1", "player2"]
      : ["player1", "player2", "player3", "player4"];

  const handlePlayerChange = (key, value) => {
    setSelectedPlayers((prev) => ({
      ...prev,
      [key]: value,
    }));

    setError("");
  };

  const handleCreateFrame = async (e) => {
    e.preventDefault();

    setError("");

    const playerIds = requiredPlayers.map((key) => selectedPlayers[key]);

    if (playerIds.some((id) => !id)) {
      setError("Please select all players.");
      return;
    }

    if (new Set(playerIds).size !== playerIds.length) {
      setError("A player cannot be selected more than once.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/frames", {
        gameType,
        player1Id: Number(selectedPlayers.player1),
        player2Id: Number(selectedPlayers.player2),
        player3Id: gameType === "2/2" ? Number(selectedPlayers.player3) : null,
        player4Id: gameType === "2/2" ? Number(selectedPlayers.player4) : null,
      });

      onFrameCreated();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Could not create frame.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-player-dropdown]")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:rounded-3xl sm:p-7 scrollbar-none">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="mt-1 text-2xl font-semibold text-gold/70 font-display">
              New Frame
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateFrame}>
          <p className="mb-3 text-sm text-zinc-400">Frame type</p>

          {/* Select frame type */}
          <div className="grid grid-cols-2 gap-3 w-60">
            {["1/1", "2/2"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setGameType(type);

                  setSelectedPlayers({
                    player1: "",
                    player2: "",
                    player3: "",
                    player4: "",
                  });
                }}
                className={`h-12 rounded-xl border font-medium transition-all ${
                  gameType === type
                    ? "border-emerald-accent/50 bg-emerald-accent/10 text-emerald-accent"
                    : "border-border bg-background text-muted-foreground hover:border-emerald-accent/30 hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Select players */}
          <div className="mt-7 space-y-5">
            {requiredPlayers.map((key, index) => {
              const selectedPlayer = players.find(
                (player) => String(player.id) === String(selectedPlayers[key]),
              );

              const searchValue = playerSearch[key].toLowerCase();

              const filteredPlayers = players.filter((player) =>
                player.username.toLowerCase().includes(searchValue),
              );

              return (
                <div key={key} className="relative" data-player-dropdown>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Player {index + 1}
                  </label>

                  {/* Search input */}
                  <input
                    type="text"
                    value={
                      openDropdown === key
                        ? playerSearch[key]
                        : selectedPlayer
                          ? selectedPlayer.username.charAt(0).toUpperCase() +
                            selectedPlayer.username.slice(1)
                          : ""
                    }
                    onFocus={() => setOpenDropdown(key)}
                    onChange={(e) => {
                      setPlayerSearch((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }));

                      setOpenDropdown(key);
                    }}
                    placeholder="Search player..."
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                    required={!selectedPlayers[key]}
                  />

                  {/* Dropdown */}
                  {openDropdown === key && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-xl scrollbar-none">
                      {filteredPlayers.length > 0 ? (
                        filteredPlayers.map((player) => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => {
                              handlePlayerChange(key, String(player.id));

                              setPlayerSearch((prev) => ({
                                ...prev,
                                [key]: "",
                              }));

                              setOpenDropdown(null);
                            }}
                            className="block w-full rounded-lg px-4 py-3 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                          >
                            {player.username.charAt(0).toUpperCase() +
                              player.username.slice(1)}
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm text-zinc-500">
                          No player found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          {/* Create frame */}
          <button
            type="submit"
            disabled={loading}
            className="mt-7 h-12 w-full rounded-xl border border-emerald-accent/30 bg-emerald-accent/10 font-semibold text-emerald-accent transition-colors hover:border-emerald-accent/50 hover:bg-emerald-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Frame"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddFrame;

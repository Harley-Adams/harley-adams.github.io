/* Stats sheet — lifetime record, streaks, guess distribution, and share. */
import React, { useState } from "react";
import Modal from "../components/Modal";
import { WordleStats } from "../lib/storage";
import { MAX_GUESSES } from "./engine";

interface Props {
  accent: string;
  stats: WordleStats;
  isDaily: boolean;
  finished: boolean;
  highlightRow?: number | null;
  onShare: () => string;
  onClose: () => void;
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="pt-stat">
      <div className="pt-stat-value">{value}</div>
      <div className="pt-stat-label">{label}</div>
    </div>
  );
}

export default function StatsModal({
  accent,
  stats,
  isDaily,
  finished,
  highlightRow,
  onShare,
  onClose,
}: Props) {
  const [copied, setCopied] = useState(false);
  const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxCount = Math.max(1, ...stats.distribution);

  const share = async () => {
    const text = onShare();
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  };

  return (
    <Modal title="Statistics" accent={accent} onClose={onClose}>
      <div className="pt-stats-row">
        <Stat value={stats.played} label="Played" />
        <Stat value={`${winPct}%`} label="Win %" />
        <Stat value={stats.currentStreak} label="Streak" />
        <Stat value={stats.maxStreak} label="Max" />
      </div>

      {isDaily && (
        <div className="pt-stats-row">
          <Stat value={stats.dailyStreak} label="Daily streak" />
          <Stat value={stats.maxDailyStreak} label="Max daily" />
        </div>
      )}

      <h3 className="pt-guide-h3">Guess distribution</h3>
      <div className="pt-dist">
        {stats.distribution.map((count, i) => {
          const isBest = finished && highlightRow === i;
          const width = Math.max(8, Math.round((count / maxCount) * 100));
          return (
            <div className="pt-dist-row" key={i}>
              <span className="pt-dist-label">{i + 1}</span>
              <div className="pt-dist-track">
                <div
                  className={`pt-dist-bar${isBest ? " pt-dist-bar-best" : ""}`}
                  style={{
                    width: `${width}%`,
                    background: isBest ? accent : undefined,
                  }}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {finished && (
        <button className="pt-share-btn" style={{ background: accent }} onClick={share}>
          {copied ? "Copied!" : "Share"}
        </button>
      )}
      <p className="pt-dist-foot">{MAX_GUESSES} guesses to solve each puzzle.</p>
    </Modal>
  );
}

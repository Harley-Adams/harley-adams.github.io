/* Sign-in sheet — pick a display name to play online. Anonymous; no password. */
import React, { useState } from "react";
import Modal from "../components/Modal";
import { useAuth } from "./AuthContext";

interface Props {
  onClose: () => void;
  onSignedIn?: () => void;
}

export default function SignInModal({ onClose, onSignedIn }: Props) {
  const { signIn, busy, error } = useAuth();
  const [name, setName] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await signIn(name);
    if (ok) {
      onSignedIn?.();
      onClose();
    }
  };

  return (
    <Modal title="Play online" accent="var(--pt-word)" onClose={onClose}>
      <p className="pt-guide-tagline">
        Pick a display name to appear on leaderboards and in versus matches.
      </p>
      <form onSubmit={submit} className="pt-signin-form">
        <input
          className="pt-input"
          type="text"
          placeholder="Display name"
          value={name}
          maxLength={20}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
        {error && <div className="pt-form-error">{error}</div>}
        <button
          type="submit"
          className="pt-share-btn"
          style={{ background: "var(--pt-word)" }}
          disabled={busy}
        >
          {busy ? "Signing in…" : "Continue"}
        </button>
      </form>
      <p className="pt-dist-foot">
        No account or password — your identity stays on this device.
      </p>
    </Modal>
  );
}

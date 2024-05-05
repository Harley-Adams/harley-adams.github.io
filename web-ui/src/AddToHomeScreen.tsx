import React, { useState, useEffect } from "react";

// Define the type for the event we expect to handle
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const useAddToHomeScreenPrompt = (): [
  BeforeInstallPromptEvent | null,
  React.Dispatch<React.SetStateAction<BeforeInstallPromptEvent | null>>
] => {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setPromptEvent(e);
    };

    // window.addEventListener(
    //   "beforeinstallprompt",
    //   handleBeforeInstallPrompt as EventListener
    // );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
    };
  }, []);

  return [promptEvent, setPromptEvent];
};

const AddToHomeScreen: React.FC = () => {
  const [promptEvent, setPromptEvent] = useAddToHomeScreenPrompt();
  const [isVisible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (promptEvent !== null) {
      setVisible(true);
    }
  }, [promptEvent]);

  const handleAddToHomeScreen = () => {
    // Hide the prompt
    setVisible(false);
    if (!promptEvent) return;

    // Show the install prompt
    promptEvent.prompt();
    // Wait for the user to respond to the prompt
    promptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      setPromptEvent(null);
    });
  };

  return isVisible ? (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "10%",
        right: "10%",
        padding: 20,
        backgroundColor: "white",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <p>
        Install this application on your home screen for a better experience.
      </p>
      <button onClick={handleAddToHomeScreen}>Add to Home Screen</button>
    </div>
  ) : null;
};

export default AddToHomeScreen;

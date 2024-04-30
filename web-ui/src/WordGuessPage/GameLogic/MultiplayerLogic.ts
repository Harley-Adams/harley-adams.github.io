import {
  LetterGuessState,
  WordleGameDataContract,
  WordlePlayerContract,
} from "../WordleContract";
import PfLoginResult from "../../PlayFab/models/PfLoginResult";
import PlayFabPubSub from "../../PlayFab/PlayFabPubSubWrapper";

export const UpdateWordleLobby = (
  pubsub: PlayFabPubSub<WordleGameDataContract, WordlePlayerContract>,
  player: PfLoginResult,
  lobbyId: string,
  update: WordlePlayerContract
): void => {
  if (!update.feedbackHistory) {
    return;
  }

  const flatLetterState = update.feedbackHistory.flatMap((feedback) => {
    return feedback.lettersFeedback.map((letterFeedback) => {
      // Do something with the feedback
      return letterFeedback.state;
    });
  });

  // Remove the raw history and replace it with the encoded guesses.
  update.feedbackHistory = undefined;
  update.encodedGuesses = encodeToBase64(flatLetterState);

  pubsub.UpdateLobby(player?.EntityToken, lobbyId, undefined, update);
};

export const ParseWordlePlayerUpdate = (
  update: WordlePlayerContract
): WordlePlayerContract => {
  if (!update.encodedGuesses) {
    return update;
  }

  const decoded = decodeFromBase64(update.encodedGuesses);
  console.log(`decoded ${decoded}`);
  update.feedbackHistory = unFlatten(decoded, 5).map((feedback) => {
    return {
      lettersFeedback: feedback.map((state) => {
        return {
          state,
        };
      }),
    };
  });

  return update;
};

function encodeToBase64(values: LetterGuessState[]): string {
  let binaryString = "";
  values.forEach((value) => {
    binaryString += value.toString(2).padStart(2, "0"); // Convert each number to a 2-bit binary string
  });

  // Ensure the length of the binary string is a multiple of 8
  while (binaryString.length % 8 !== 0) {
    binaryString += "00"; // Padding with zeros
  }

  const byteArray = new Uint8Array(binaryString.length / 8);
  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = parseInt(binaryString.substring(8 * i, 8 * (i + 1)), 2);
  }

  // Use Buffer or btoa for browser environment to convert byteArray to Base64
  if (typeof btoa === "function") {
    return btoa(String.fromCharCode(...byteArray));
  } else {
    // Node.js environment
    return Buffer.from(byteArray).toString("base64");
  }
}

function decodeFromBase64(encoded: string): LetterGuessState[] {
  // Convert Base64 to a binary string
  let binaryString = "";
  const bytes =
    typeof atob === "function"
      ? atob(encoded)
      : Buffer.from(encoded, "base64").toString("binary");
  bytes.split("").forEach((char) => {
    binaryString += char.charCodeAt(0).toString(2).padStart(8, "0");
  });

  // Read each 2 bits as a value
  const values = [];
  for (let i = 0; i < binaryString.length; i += 2) {
    const value = parseInt(binaryString.substring(i, i + 2), 2);
    console.log(`value ${value}`);
    if (isNaN(value)) {
      break; // Handle padding
    }
    values.push(value);
  }
  return values;
}

function unFlatten(
  array: LetterGuessState[],
  chunkSize: number
): LetterGuessState[][] {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    // If we don't have a full chunk, it means we have hit padding in the base64 encoding.
    if (chunk.length < chunkSize) {
      break;
    }
    result.push(chunk);
  }
  return result;
}

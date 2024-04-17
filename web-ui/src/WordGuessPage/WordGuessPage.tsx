import WordGuessGame from "./WordGuessGame";
import "./WordGuessPage.css"; // You can define your styles here
import { WordList } from "./WordList";

function WordGuessPage(): JSX.Element {
  let randomIndex = Math.floor(Math.random() * WordList.length);
  let word = WordList[randomIndex];

  return (
    <div>
      <WordGuessGame word={word} />
    </div>
  );
}

export default WordGuessPage;

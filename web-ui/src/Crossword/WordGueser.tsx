import { CButton, CForm, CFormInput, CSpinner } from "@coreui/react";
import { useState } from "react";

interface Props {
  answerId: string | null;
  clue: string | null;
  partialWord: string;
}

function WordGuesser(props: Props) {
  const [guessIsCorrect, setGuessIsCorrect] = useState<boolean>(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    let formData = new FormData(event.currentTarget);
    let guess = formData.get("wordGuessInput");

    // Replace with checking from API
    if (guess == "") {
      setGuessIsCorrect(true);
    }
  }

  if (!guessIsCorrect) {
    return (
      <div className="WordGuesser">
        <h2>Word: {props.partialWord}</h2>
        <h3>Clue: {props.clue}</h3>
        <CForm onSubmit={onSubmit}>
          <CFormInput
            id="wordGuessInput"
            placeholder=""
            aria-label="WordGuess"
            name="wordGuessInput"
            defaultValue={props.partialWord}
            floatingLabel="Guess"
          />
          <CButton
            type="submit"
            color="primary"
            variant="outline"
            id="button-addon2"
          >
            Submit
          </CButton>
        </CForm>
      </div>
    );
  } else {
    return <div>You did it!</div>;
  }
}

export default WordGuesser;

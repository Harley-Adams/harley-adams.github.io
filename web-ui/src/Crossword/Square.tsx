interface Props {
  letter: string;
  setLetter: (letter: string) => {};
}

function Square(props: Props) {
  return <div>{props.letter}</div>;
}

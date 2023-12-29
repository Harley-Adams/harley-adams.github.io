interface Props {
  words: string[];
}

function CrosswordGrid(props: Props) {
  let projectedWords = props.words.map((val) => (
    <div className="CrosswordRow">
      {val}
      <br />
    </div>
  ));
  return <div className="CrosswordGrid">{projectedWords}</div>;
}

export default CrosswordGrid;

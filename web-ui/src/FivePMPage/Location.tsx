export interface LocationProps {
  locationName: string;
  drinkRequest?: string;
}

function Location({ locationName, drinkRequest }: LocationProps) {
  return (
    <div>
      <h3> Yes!</h3>
      <div className="App-intro">It is 5pm in {locationName}</div>
    </div>
  );
}

export default Location;

import * as React from "react";
import {
  getInfoFromTimeZone,
  getTimeZoneCurrentlyFivePM,
} from "./TimeZoneCaluclator";
import "./FivePM.css";

import Location from "./Location";

class FivePM extends React.Component<{}, {}> {
  render() {
    const timeZoneAtFivePM = getTimeZoneCurrentlyFivePM();
    const fivePMCity = getInfoFromTimeZone(timeZoneAtFivePM);

    return (
      <div className="fivePm">
        <h2>Life's greatest question, Can I have a drink?</h2>
        <Location {...fivePMCity} />
      </div>
    );
  }
}

export default FivePM;

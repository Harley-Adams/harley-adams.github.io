export function getTimeZoneCurrentlyFivePM(): number {
  const localTime = new Date();
  const utcHour = localTime.getUTCHours();
  let offsetToFivePMTimeZone = -7 - utcHour;
  if (offsetToFivePMTimeZone < -12) {
    offsetToFivePMTimeZone += 24;
  }
  return offsetToFivePMTimeZone;
}

export function getInfoFromTimeZone(timeZone: number) {
  switch (timeZone) {
    case -12:
    case 12:
      return {
        locationName: "Auckland, New Zealand",
        drinkRequest: "Kia ora bro, pass us a drink",
      };
    case -11:
      return { locationName: "Alofi, Niue" };
    case -10:
      return { locationName: "Rarotonga, Cook Islands" };
    case -9:
      return { locationName: "Anchorage AK, USA" };
    case -8:
      return {
        locationName: "Vancouver BC, Canada",
        drinkRequest: "donne moi un verre",
      };
    case -7:
      return { locationName: "Phoenix AZ, USA" };
    case -6:
      return { locationName: "Austin TX, USA" };
    case -5:
      return { locationName: "Kingston, Jamaica" };
    case -4:
      return { locationName: "Puerto Rico, USA" };
    case -3:
      return { locationName: "Buenos Aires, Argentina" };
    case -2:
      return { locationName: "South Georgia and the South Sandwich Islands" };
    case -1:
      return { locationName: "Praia, Cape Verde" };
    case 0:
      return { locationName: "London, United Kingdom" };
    case 1:
      return { locationName: "Copenhagen, Denmark" };
    case 2:
      return { locationName: "Cairo, Egypt" };
    case 3:
      return { locationName: "Moscow, Russia" };
    case 4:
      return { locationName: "Dubai, United Arab Emirates" };
    case 5:
      return { locationName: "Malé, Maldives" };
    case 6:
      return { locationName: "Dhaka, Bangladesh" };
    case 7:
      return { locationName: "Bangkok, Thailand" };
    case 8:
      return { locationName: "Perth, Australia" };
    case 9:
      return { locationName: "Tokyo, Japan" };
    case 10:
      return { locationName: "Canberra, Australia" };
    case 11:
      return { locationName: "Port Vila, Vanuatu" };
    default:
      return { locationName: "ERROR" };
  }
}

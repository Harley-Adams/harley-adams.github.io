/* PlayFab connection config. Title A8129 is a client-only title (anonymous
 * LoginWithCustomID + entity tokens); no server secret is used in the browser. */
export const PLAYFAB_TITLE_ID = "A8129";
export const PLAYFAB_BASE_API = `https://${PLAYFAB_TITLE_ID}.playfabapi.com/`;

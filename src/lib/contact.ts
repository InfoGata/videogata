/**
 * The addresses and links the app publishes. Shared so the About page, the
 * abuse page and anything added later can't drift apart, and so an address can
 * be repointed in one place rather than hunted for.
 */

export const contactEmail = "contact@videogata.com";

/**
 * Kept separate from contactEmail so abuse and copyright reports can move to
 * their own inbox by changing this line. It points at the general contact for
 * now because that is the address known to be delivered; repoint it once a
 * dedicated abuse address exists on the domain's mail provider.
 */
export const abuseEmail = contactEmail;

export const repoUrl = "https://github.com/InfoGata/videogata";
export const abusePolicyUrl = `${repoUrl}/blob/master/ABUSE.md`;

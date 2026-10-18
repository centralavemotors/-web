import "server-only";

/** DealerSocket ADF inbox. Not shown on the website. */
export const DEFAULT_LEAD_TO = "webleads@yonkersautogallery.dsmessage.com";

export function leadToAddress() {
  return process.env.LEAD_TO_EMAIL?.trim() || DEFAULT_LEAD_TO;
}

export function leadBackupAddress() {
  const backup = process.env.LEAD_BACKUP_EMAIL?.trim();
  return backup || undefined;
}

export const REFRESH_UNREAD_EVENT = 'social:refresh-unread';

export function dispatchRefreshUnread() {
  window.dispatchEvent(new CustomEvent(REFRESH_UNREAD_EVENT));
}

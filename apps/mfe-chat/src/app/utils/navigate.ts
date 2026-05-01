/**
 * Cross-MFE navigation via custom event.
 *
 * When embedded in the shell (port 3000) the NavigationBridge component
 * intercepts this event and calls Next.js router.push() — no page reload.
 *
 * In standalone dev mode (port 4201) no listener exists, so we fall back
 * to window.location.href after a short tick to give the event a chance
 * to be handled first.
 */
export function navigateTo(path: string) {
  const event = new CustomEvent('chatapp:navigate', {
    detail: { path },
    bubbles: true,
    cancelable: true,
  });

  const handled = window.dispatchEvent(event);

  // dispatchEvent returns false only if the event was cancelled.
  // We use cancelable:true so the shell bridge can cancel it to signal
  // "I handled this — don't fall back".
  // In standalone mode the event is not cancelled → fall back.
  if (handled) {
    setTimeout(() => {
      window.location.href = path;
    }, 100);
  }
}

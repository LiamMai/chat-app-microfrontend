export function navigateTo(path: string): void {
  const event = new CustomEvent('chatapp:navigate', {
    detail: { path },
    bubbles: true,
    cancelable: true,
  });

  const handled = window.dispatchEvent(event);

  if (handled) {
    setTimeout(() => {
      window.location.href = path;
    }, 100);
  }
}

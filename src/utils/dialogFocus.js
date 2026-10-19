// Native dialogs isolate the page; explicitly wrap Tab before browser chrome.
export function trapDialogFocus(event) {
  if (event.key !== 'Tab') return
  const dialog = event.currentTarget
  const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])')]
    .filter(element => element.tabIndex >= 0 && element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden' && !element.closest('[inert]'))
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (!first) { event.preventDefault(); dialog.focus(); return }
  if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
    event.preventDefault(); last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus()
  }
}

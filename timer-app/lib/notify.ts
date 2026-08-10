import { toast } from "@/components/ui/toast";

const AUTO_DISMISS_MS = 5000;

// base-ui's toast primitive pauses its own auto-dismiss timer whenever the
// toast is hovered OR the browser window loses focus (by design, so a user
// reading a toast doesn't lose it mid-read) -- see
// node_modules/@base-ui/react/toast/store.js's `expandedOrOutOfFocus`.
// This app wants a strict "always gone after 5s" toast regardless, so
// dismissal is driven by a plain, un-pausable setTimeout instead. The
// Toaster's own `timeout` prop is set to 0 (disabled) so there's exactly
// one dismissal mechanism, not two racing.
export function notify(options: Parameters<typeof toast.add>[0]) {
  const id = toast.add(options);
  setTimeout(() => toast.close(id), AUTO_DISMISS_MS);
  return id;
}

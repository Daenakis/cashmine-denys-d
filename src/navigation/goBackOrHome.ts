import { router } from 'expo-router';

// Deep-linked screens have no history entry to return to, so fall back to Home.
export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

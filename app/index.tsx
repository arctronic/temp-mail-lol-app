import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect directly to the inbox page
  return <Redirect href="/(drawer)" />;
} 
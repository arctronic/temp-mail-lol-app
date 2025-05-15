import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the drawer navigation
  return <Redirect href="/(drawer)/index" />;
} 
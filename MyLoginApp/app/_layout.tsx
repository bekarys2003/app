// /Users/beka/Desktop/proj/startup/MyLoginApp/app/_layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useCallback, useContext } from "react";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import { AuthProvider, AuthContext } from "../context/AuthContext"; // ✅ import AuthProvider and context
import Toast from "react-native-toast-message";

SplashScreen.preventAutoHideAsync(); // keep splash until ready

function RootLayoutInner() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const segments: string[] = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthTabs = segments.includes("auth-tabs");
    const inLogin = segments.includes("login") || segments.includes("signup");

    if (!isAuthenticated && !inAuthTabs && !inLogin) {
      router.replace("/(tabs)/auth-tabs/auth" as any);
    }

    if (isAuthenticated && (inAuthTabs || inLogin)) {
      router.replace("/(tabs)"); // ✅ adjust this to match your app structure
    }
  }, [isAuthenticated, isLoading, segments]);


  if (isLoading) return null;
  return (
  <>
  <Slot />
  <Toast />
  </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        const images = [
          require("../assets/images/pexels-athena-2180877.jpg"),
          require("../assets/images/pexels-ikeen-james-1194926-2274787.jpg"),
          require("../assets/images/pexels-pixabay-263070.jpg"),
          require("../assets/images/pexels-valeriya-1639557.jpg"),
        ].map(img => Asset.loadAsync(img));

        const fonts = Font.loadAsync({
          SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        });

        await Promise.all([...images, fonts]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!isReady) return null;

  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}

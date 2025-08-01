import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useCallback } from "react";
import * as Font from "expo-font";
import { Asset } from "expo-asset";

SplashScreen.preventAutoHideAsync(); // keep splash until ready

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

  return <Slot />;
}

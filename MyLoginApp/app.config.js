import 'dotenv/config';

export default {
  expo: {
    name: "MyLoginApp",
    slug: "MyLoginApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myloginapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      API_BASE_URL: process.env.API_BASE_URL,
      GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
      eas: {
        projectId: "0a9284af-2335-4bf8-b895-b854ff424440", // optional but good to have
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bekarys.myloginapp",
      config: {
        googleSignIn: {
            reservedClientId: "com.googleusercontent.apps.143780086959-v4mqb5i2893asj6tgh6q6fat62ro0op3"
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.bekarys.myloginapp",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
        [
            "@react-native-google-signin/google-signin",
            {
              iosUrlScheme: "com.googleusercontent.apps.143780086959-v4mqb5i2893asj6tgh6q6fat62ro0op3"
            }
          ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-font",
      "expo-asset"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};

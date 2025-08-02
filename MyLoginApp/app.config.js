import 'dotenv/config';

export default {
  expo: {
    name: "MyLoginApp",
    slug: "myloginapp",
    scheme: "myloginapp",
    extra: {
      API_BASE_URL: process.env.API_BASE_URL,
    },
  },
};

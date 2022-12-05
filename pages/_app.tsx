import Head from "next/head";
import { AppProps } from "next/app";

import { Layout } from "../components";

const App = (props: AppProps) => {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Andrés Montoya Software Developer</title>
        <meta
          name="description"
          content="Andrés Montoya Software Developer with a focus on building cool projects :p"
        />
        <meta
          property="og:title"
          content="Andrés Montoya Software Developer with a focus on building cool projects :p"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Andrés Montoya Software Developer with a focus on building cool projects :p"
        />
        <meta
          property="og:image"
          content="https://arweave.net/MlLyEZ06S2hWkCM78SpbEpLQQtNYBkJBrcGKHrDJUdA"
        />
        <meta property="og:url" content="https://andresmontoya.eth/" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/png" href="/favicon.ico"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;800&display=swap");

        :root {
          --primary-color: #269793;
          --light-primary-color: #eafcf8;
          --secondary-color: #1a2c40;
          --light-secondary-color: #1a2c40cc;
          --gray-color: #dadce0;
          --white-color: #fff;
          --melrose-color: #bdb4fe;

          --shadow-smallest: 0px 10px 50px #00000029;
          --shadow-small: 0px 3px 20px #00000040;

          --font-xs: 12px;
          --font-sm: 14px;
          --font-base: 16px;
          --font-lg: 18px;
          --font-xl: 20px;
          --font-2xl: 24px;
          --font-3xl: 26px;
          --font-4xl: 34px;
          --font-5xl: 40px;
        }

        * {
          font-family: "Bitter", serif;
          box-sizing: border-box;
          font-weight: 400;
        }

        html,
        body {
          scroll-behavior: smooth;
          margin: 0;
          padding: 0;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-weight: initial;
          margin: 0;
          padding: 0;
        }

        a {
          text-decoration: none;
        }
      `}</style>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
};

export default App;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './main.css';//This is for the styles
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
// import { BrowserRouter } from "react-router-dom";
import { consumeGoogleLoginToken } from './utils/auth';
import './utils/install'; // must load early to catch the browser's one-time install prompt

consumeGoogleLoginToken();

//We can also import React and ReactDOM from the modules above without the curly braises
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('Service Worker registered:', registration);
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}


// Instagram's current dark theme (instagram.com, 2026): near-black blue-grey page,
// #f5f5f5 text, system font at 14px, lighter surfaces for menus/dialogs.
const colors = {
  ig: {
    bg: "#0c1014",
    surface: "#1b1f24",
    hover: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.12)",
    text: "#f5f5f5",
    secondary: "#a8a8a8",
    link: "#0095f6",
  },
};

const fonts = {
  heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
  body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
};

const styles = {
  global: (props) => ({
    body: {
      bg: mode("gray.100", "ig.bg")(props),
      color: mode("gray.800", "ig.text")(props),
      fontSize: "14px",
    },
  }),
};

// Dialogs and menus sit on the lighter surface, like Instagram's.
const components = {
  Modal: { baseStyle: { dialog: { bg: "ig.surface" } } },
  Menu: { baseStyle: { list: { bg: "ig.surface", borderColor: "ig.border" }, item: { bg: "ig.surface", _hover: { bg: "ig.hover" } } } },
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};


// 3. extend the theme
const theme = extendTheme({ config, styles, colors, fonts, components });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      {/* THis is for Creating Routes and Pages */}
      <App/>
    </ChakraProvider>
  </StrictMode>
)
console.log('Hello world')

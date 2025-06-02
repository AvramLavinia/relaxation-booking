// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
 
// initialize Firebase (and analytics) side-effect
import "./firebase";
 
ReactDOM.render(
<React.StrictMode>
<App />
</React.StrictMode>,
  document.getElementById("root")
);
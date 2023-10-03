import React, { Component } from "react";
import ReactDom from "react-dom";
import ReactMarkdown from "react-markdown";
import AppMarkdown from "./markdownsample.md";

function MarkdownHost() {
  let [readable, setReadable] = React.useState({ md: "" });

  React.useEffect(() => {
    fetch(AppMarkdown)
      .then((res) => res.text())
      .then((md) => {
        setReadable({ md });
      });
  }, []);

  return <ReactMarkdown>{readable.md}</ReactMarkdown>;
}

export default MarkdownHost;

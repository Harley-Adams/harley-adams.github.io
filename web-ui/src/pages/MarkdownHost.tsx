import React, { Component } from "react";
import ReactDom from "react-dom";
import ReactMarkdown from "react-markdown";
import AppMarkdown from "./markdownsample.md";

const markdownSource = `
# Hello *there*! test asdI'm not much of a blogger, 
but this is markdown!
`;

function MarkdownHost() {
  // var read = fs.readFileSync(AppMarkdown);
  // console.log(read);
  // var res = "";
  // var read = fetch(AppMarkdown).then((res) => res.text());
  let [readable, setReadable] = React.useState({ md: "" });

  React.useEffect(() => {
    fetch(AppMarkdown)
      .then((res) => res.text())
      .then((md) => {
        setReadable({ md });
      });
  }, []);
  // return <div>{AppMarkdown}</div>;
  return <ReactMarkdown>{readable.md}</ReactMarkdown>;
}

export default MarkdownHost;

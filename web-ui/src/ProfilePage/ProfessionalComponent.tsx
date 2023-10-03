import React from "react";
import ProfessionalDataPoint from "./ProfessionalDataPoint";

export const ProfessionalComponent = (props: ProfessionalDataPoint) => {
  const postClassName = props.LeftImagePost
    ? "left-image-post"
    : "right-image-post";
  const imageClassName = props.LeftImagePost ? "left-image" : "right-image";
  const textClassName = props.LeftImagePost ? "right-text" : "left-text";

  let linkElement: JSX.Element | undefined = undefined;
  if (props.LinkText !== undefined && props.LinkUrl !== undefined) {
    linkElement = (
      <div className="white-button">
        <a href={props.LinkUrl}>{props.LinkText}</a>
      </div>
    );
  }

  // There is probably a better way to do this...
  if (props.LeftImagePost) {
    return (
      <div className={postClassName}>
        <div className="row">
          <div className="column">
            <div className={imageClassName}>
              <img src={props.ImageFileName} alt={props.ImageAltText} />
            </div>
          </div>
          <div className="column">
            <div className={textClassName}>
              <h4>{props.Header}</h4>
              <p>{props.TimeLine}</p>
              <p> {props.Description}</p>
              {linkElement}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={postClassName}>
      <div className="row">
        <div className="column">
          <div className={textClassName}>
            <h4>{props.Header}</h4>
            <p>{props.TimeLine}</p>
            <p> {props.Description}</p>
            {linkElement}
          </div>
        </div>
        <div className="column">
          <div className={imageClassName}>
            <img src={props.ImageFileName} alt={props.ImageAltText} />
          </div>
        </div>
      </div>
    </div>
  );
};

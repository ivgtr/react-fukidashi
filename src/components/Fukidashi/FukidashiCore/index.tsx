import { css } from "@linaria/core";
import React from "react";
import { FukidashiProps } from "../../../types";
import { SpeachText } from "./SpeachText";

const styles = {
  fukidashiBox: css`
    position: absolute;
    top: var(--box-top, auto);
    right: var(--box-right, auto);
    bottom: var(--box-bottom, auto);
    left: var(--box-left, auto);
    width: 300px;
    background-color: #fff;
    border: 2px solid #444;
    border-radius: 5px;
    transform: translateY(var(--transform-top, 0));

    &::before {
      position: absolute;
      top: var(--arrow-before-top, auto);
      right: var(--arrow-before-right, auto);
      bottom: var(--arrow-before-bottom, auto);
      left: var(--arrow-before-left, auto);
      width: 20px;
      height: 20px;
      clip-path: polygon(0 0, 100% 0, 100% 100%);
      content: "";
      background-color: #444;
      transform: rotate(var(--transform-rotate, 0));
    }

    &::after {
      position: absolute;
      top: var(--arrow-after-top, auto);
      right: var(--arrow-after-right, auto);
      bottom: var(--arrow-after-bottom, auto);
      left: var(--arrow-after-left, auto);
      width: 16px;
      height: 16px;
      clip-path: polygon(0 0, 100% 0, 100% 100%);
      content: "";
      background-color: #fff;
      transform: rotate(var(--transform-rotate, 0deg));
    }
  `,
  fukidashiText: css`
    padding: 10px 0;
  `,
};

export const FukidashiCore: React.FC<FukidashiProps> = ({ text, placement }) => {
  const setPosition = React.useCallback(() => {
    let position = {};
    switch (placement) {
      case "top":
        position = {
          "--box-bottom": `calc(100% + 50px)`,
          "--box-left": "calc(50% - 150px)",
          "--arrow-before-top": "100%",
          "--arrow-before-left": "10%",
          "--arrow-after-top": "calc(100% - 2px)",
          "--arrow-after-left": "calc(10% + 1px)",
        };
        break;
      case "right":
        position = {
          "--box-top": `50%`,
          "--box-left": "calc(100% + 50px)",
          "--transform-top": "-50%",
          "--arrow-before-top": "10%",
          "--arrow-before-right": "100%",
          "--arrow-after-top": "calc(10% + 1px)",
          "--arrow-after-right": "calc(100% - 2px)",
          "--transform-rotate": "90deg",
        };
        break;
      case "bottom":
        position = {
          "--box-top": `calc(100% + 50px)`,
          "--box-left": "calc(50% - 150px)",

          "--arrow-before-bottom": "100%",
          "--arrow-before-right": "10%",
          "--arrow-after-bottom": "calc(100% - 2px)",
          "--arrow-after-right": "calc(10% + 1px)",
          "--transform-rotate": "180deg",
        };
        break;
      case "left":
        position = {
          "--box-top": `50%`,
          "--box-right": "calc(100% + 50px)",
          "--transform-top": "-50%",

          "--arrow-before-bottom": "10%",
          "--arrow-before-left": "100%",
          "--arrow-after-bottom": "calc(10% + 1px)",
          "--arrow-after-left": "calc(100% - 2px)",
          "--transform-rotate": "270deg",
        };
        break;
      default:
        position = { "--box-bottom": `calc(100% + 50px)`, "--box-left": "calc(50% - 150px)" };
    }

    return position as React.CSSProperties;
  }, [placement]);
  return (
    <div className={styles.fukidashiBox} style={setPosition()}>
      <div>
        <p style={{ padding: "10px", visibility: "hidden" }}>
          {(typeof text === "string" ? [text] : [...text]).map((value, key) => {
            return (
              <React.Fragment key={key}>
                <span className={styles.fukidashiText}>{value}</span>
                <br />
              </React.Fragment>
            );
          })}
        </p>
      </div>
      <div style={{ position: "absolute", top: "0", left: "0" }}>
        <p style={{ padding: "10px" }}>
          {(typeof text === "string" ? [text] : [...text]).map((value, key) => {
            return (
              <React.Fragment key={key}>
                <SpeachText text={value} />
                <br />
              </React.Fragment>
            );
          })}
        </p>
      </div>
    </div>
  );
};

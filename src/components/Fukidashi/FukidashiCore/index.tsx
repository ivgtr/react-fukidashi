import { css } from "@linaria/core";
import React, { useState } from "react";
import { FukidashiProps } from "../../../types";

const styles = {
  fukidashiBox: css`
    position: absolute;
    top: var(--box-top, auto);
    left: calc(50% - 150px);
    width: 300px;
    padding: 10px;
    background-color: #fff;
    border: 4px solid #444;
    border-radius: 5px;

    &::before {
      position: absolute;
      bottom: -23px;
      left: 28px;
      width: 0;
      height: 0;
      content: "";
      border-top: 10px solid #444;
      border-right: 10px solid #444;
      border-bottom: 10px solid transparent;
      border-left: 10px solid transparent;
    }

    &::after {
      position: absolute;
      bottom: -13px;
      left: 24px;
      width: 0;
      height: 0;
      content: "";
      border-top: 10px solid #fff;
      border-right: 10px solid #fff;
      border-bottom: 10px solid transparent;
      border-left: 10px solid transparent;
    }
  `,
  fukidashiText: css`
    padding: 10px 0;
  `,
};

export const FukidashiCore: React.FC<FukidashiProps> = (props) => {
  const [boxHeight, setBoxHeight] = useState<number>(500);
  return (
    <div
      ref={(ref) => setBoxHeight(ref?.clientHeight ? ref.clientHeight + 50 : 500)}
      className={styles.fukidashiBox}
      style={{ "--box-top": `-${boxHeight}px` } as React.CSSProperties}
    >
      <p>
        {[...props.text].map((value, key) => {
          return (
            <React.Fragment key={key}>
              <span className={styles.fukidashiText}>{value}</span>
              <br />
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
};

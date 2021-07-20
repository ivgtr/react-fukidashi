import { css } from "@linaria/core";
import React from "react";
import { FukidashiProps } from "../../types";
import { FukidashiCore } from "./FukidashiCore";

const styles = {
  fukidashi: css`
    position: relative;
    font-size: 14px;
    text-align: left;
  `,
};

export const Fukidashi: React.FC<FukidashiProps> = (props) => {
  return (
    <div className={styles.fukidashi}>
      {props.children}
      <FukidashiCore {...props} />
    </div>
  );
};

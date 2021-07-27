import { css } from "@linaria/core";
import React, { memo } from "react";

const styles = {
  placeholder: css`
    visibility: hidden;
  `,
  text: css`
    padding: 10px 0;
  `,
  wrapper: css`
    padding: 10px;
  `,
};

export const SpeechPlaceholder: React.VFC<{ text: string[] }> = memo(({ text }) => {
  return (
    <div className={styles.placeholder}>
      <p className={styles.wrapper}>
        {text.map((value, key) => {
          return (
            <React.Fragment key={key}>
              <span className={styles.text}>{value}</span>
              <br />
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
});

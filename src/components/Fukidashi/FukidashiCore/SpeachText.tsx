import { css } from "@linaria/core";
import React, { useEffect, useState } from "react";

type Props = {
  text: string;
};

const styles = {
  fukidashiText: css`
    padding: 10px 0;
  `,
};

export const SpeachText: React.VFC<Props> = (props) => {
  const [currentText, setCurrentText] = useState<string>("");
  let index: number = 0;
  useEffect(() => {
    if (props.text) {
      const timer = setInterval(() => {
        setCurrentText(props.text.slice(0, index));
        index += 1;
      }, 100);

      return () => {
        clearInterval(timer);
      };
    }
    return;
  }, [props.text]);

  return <span className={styles.fukidashiText}>{currentText}</span>;
};

import { css } from "@linaria/core";
import React, { useEffect } from "react";
import { Delay } from "./Delay";
import { Speeching } from "./Speeching";
import { SpeechPlaceholder } from "./SpeechPlaceholder";

const styles = {
  box: css`
    position: absolute;
    top: 0;
    left: 0;
  `,
  text: css`
    padding: 10px 0;
    color: #444;
  `,
  wrapper: css`
    padding: 10px;
  `,
};

type Props = {
  text: string[];
  delay: number;
  onSpeechingDone: Function;
};

export const Speech: React.VFC<Props> = ({ text, onSpeechingDone, delay }) => {
  useEffect(() => {
    return () => {
      onSpeechingDone();
    };
  }, [onSpeechingDone]);

  return (
    <>
      <SpeechPlaceholder text={text} />
      <div className={styles.box}>
        <p className={styles.wrapper}>
          <Speeching>
            {text.map((value) => {
              return (
                <React.Fragment key={`key-${Math.random() + Math.random()}`}>
                  <span className={styles.text}>{value}</span>
                  <Delay ms={delay} />
                </React.Fragment>
              );
            })}
          </Speeching>
        </p>
      </div>
    </>
  );
};

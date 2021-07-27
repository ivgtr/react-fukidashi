import React, { useMemo } from "react";
import { Delay } from "./Delay";
import { SpeechIt } from "./SpeechIt";

export const Speeching: React.FC = ({ children }) => {
  const Tree = useMemo(() => {
    if (Array.isArray(children)) {
      let delay: number = 0;
      return children
        .map((i: any) => {
          return i.props.children.map((j: React.ReactElement) => {
            if (j.type === Delay) {
              delay += j.props.ms;
              return <br key={`key-${Math.random() + Math.random()}`} />;
            } else {
              const element = (
                <SpeechIt
                  text={j.props.children}
                  delay={delay}
                  key={`key-${Math.random() + Math.random()}`}
                />
              );
              delay += j.props.children.length * 100;
              return element;
            }
          });
        })
        .flat();
    } else {
      return undefined;
    }
  }, [children]);

  return <>{Tree}</>;
};

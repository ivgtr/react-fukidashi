import { css } from "@linaria/core";
import React, { useMemo } from "react";
import { FukidashiProps } from "../../types";
import { Box } from "../Box";
import { Speech } from "../Speech";

const styles = {
  Fukidashi: css`
    position: relative;
    font-size: 14px;
    text-align: left;
  `,
};

export const Fukidashi: React.FC<FukidashiProps> = ({
  children,
  text,
  placement = "top",
  width = 300,
  gap = 50,
  delay = 1000,
  onSpeechingDone = () => {},
}) => {
  const conversionText = useMemo(() => {
    return typeof text === "string" ? [...text.split("\n")] : text;
  }, [text]);

  return (
    <div className={styles.Fukidashi}>
      {children}
      <Box placement={placement} width={width} gap={gap}>
        <Speech text={conversionText} delay={delay} onSpeechingDone={onSpeechingDone} />
      </Box>
    </div>
  );
};

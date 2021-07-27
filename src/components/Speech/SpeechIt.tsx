import React, { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  delay: number;
};

export const SpeechIt: React.VFC<Props> = ({ text, delay }) => {
  const [speech, setSpeech] = useState<string>("");
  const refText = useRef<string>(text);
  const refTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  refText.current = speech;

  const handleSpeech = useCallback(() => {
    if (text.length > refText.current.length) {
      setSpeech(text.substring(0, refText.current.length + 1));

      refTimer.current = setTimeout(handleSpeech, 100);
    }
  }, [text]);

  useEffect(() => {
    setTimeout(handleSpeech, delay);
    return () => clearTimeout(refTimer.current);
  }, [handleSpeech, delay]);

  return <span>{speech}</span>;
};

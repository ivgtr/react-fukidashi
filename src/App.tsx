import React from "react";
import { Fukidashi } from "./components/Fukidashi";

const App = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Fukidashi
          text={[
            "くぅ～疲れましたw これにて完結です！",
            "実は、ネタレスしたら代行の話を持ちかけられたのが始まりでした",
            "本当は話のネタなかったのですが←",
            "ご厚意を無駄にするわけには行かないので流行りのネタで挑んでみた所存ですw",
          ]}
        >
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden" }}>
            <img
              src="https://github.com/ivgtr.png"
              style={{ width: "100%", height: "100%", backgroundClip: "cover" }}
            />
          </div>
        </Fukidashi>
      </div>
    </div>
  );
};

export default App;

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
        <Fukidashi text={"くぅ～疲れましたw これにて完結です！"} placement={"top"}>
          <Fukidashi
            text={[
              "実は、ネタレスしたら代行の話を持ちかけられたのが始まりでした",
              "本当は話のネタなかったのですが←",
            ]}
            placement={"right"}
          >
            <Fukidashi
              text={"ご厚意を無駄にするわけには行かないので流行りのネタで挑んでみた所存ですw"}
              placement={"bottom"}
            >
              <Fukidashi
                text={[
                  "以下、まどか達のみんなへのメッセジをどぞ",
                  "",
                  "まどか「みんな、見てくれてありがとうちょっと腹黒なところも見えちゃったけど・・・気にしないでね！」",
                ]}
                placement={"left"}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="https://github.com/ivgtr.png"
                    style={{ width: "100%", height: "100%", backgroundClip: "cover" }}
                  />
                </div>
              </Fukidashi>
            </Fukidashi>
          </Fukidashi>
        </Fukidashi>
      </div>
    </div>
  );
};

export default App;

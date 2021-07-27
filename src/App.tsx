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
      <Fukidashi text={"くぅ～疲れましたw これにて完結です！"} placement={"top"}>
        <Fukidashi
          text={[
            "実は、ネタレスしたら代行の話を持ちかけられたのが始まりでした",
            "本当は話のネタなかったのですが←",
            "ご厚意を無駄にするわけには行かないので流行りのネタで挑んでみた所存ですw",
          ]}
          placement={"right"}
        >
          <Fukidashi text={"以下、まどか達のみんなへのメッセジをどぞ"} placement={"left"}>
            <Fukidashi
              text={`まどか「みんな、見てくれてありがとう
                ちょっと腹黒なところも見えちゃったけど・・・気にしないでね！」

                さやか「いやーありがと！
                私のかわいさは二十分に伝わったかな？」

                マミ「見てくれたのは嬉しいけどちょっと恥ずかしいわね・・・」

                京子「見てくれありがとな！
                正直、作中で言った私の気持ちは本当だよ！」

                ほむら「・・・ありがと」ﾌｧｻ`}
              placement={"bottom"}
            >
              <div style={{ textAlign: "center" }}>
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
              </div>
            </Fukidashi>
          </Fukidashi>
        </Fukidashi>
      </Fukidashi>
    </div>
  );
};

export default App;

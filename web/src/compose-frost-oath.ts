import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";

const clips = [
    "/api/resources/b224034ffd51d8baa4124eed5011fd4c/file",
    "/api/resources/b51621861838de1fefabc1967c573c37/file",
    "/api/resources/3c93efa5fda76d9d934613566f5590b7/file",
    "/api/resources/a055354c991d4fa9af485dea0d2acdad/file",
    "/api/resources/5358902e839a6584f914d46403d35912/file",
    "/api/resources/c34d9f079a2b411f51630dd07735aa11/file",
];

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main style="font-family:system-ui,sans-serif;max-width:700px;margin:80px auto;padding:32px;color:#eee;background:#171717;border-radius:16px">
    <h1 style="margin-top:0">《霜誓》六段成片</h1>
    <p id="status">准备加载本地视频剪辑引擎…</p>
    <progress id="progress" max="100" value="0" style="width:100%"></progress>
    <video id="preview" controls playsinline style="display:none;width:100%;margin-top:24px;border-radius:10px"></video>
    <a id="download" style="display:none;margin-top:20px;padding:12px 16px;background:#fff;color:#111;border-radius:8px;text-decoration:none;font-weight:700">下载《霜誓》完整成片</a>
  </main>`;

const status = document.querySelector<HTMLParagraphElement>("#status")!;
const progress = document.querySelector<HTMLProgressElement>("#progress")!;
const preview = document.querySelector<HTMLVideoElement>("#preview")!;
const download = document.querySelector<HTMLAnchorElement>("#download")!;

async function render() {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: value }) => { progress.value = Math.min(100, Math.round(value * 100)); });
    await ffmpeg.load({ coreURL, wasmURL });
    for (let index = 0; index < clips.length; index += 1) {
        status.textContent = `正在读取镜头 ${index + 1}/6…`;
        const response = await fetch(clips[index]);
        if (!response.ok) throw new Error(`镜头 ${index + 1} 读取失败：${response.status}`);
        await ffmpeg.writeFile(`input-${index}.mp4`, await fetchFile(await response.blob()));
        progress.value = Math.round(((index + 1) / clips.length) * 20);
    }
    status.textContent = "正在按镜头衔接规则编码成片…";
    const filter = [
        "[0:v]setpts=PTS-STARTPTS[v0]", "[1:v]setpts=PTS-STARTPTS[v1]", "[2:v]setpts=PTS-STARTPTS[v2]",
        "[3:v]setpts=PTS-STARTPTS[v3]", "[4:v]setpts=PTS-STARTPTS[v4]", "[5:v]setpts=PTS-STARTPTS[v5]",
        "[v0][v1]xfade=transition=fade:duration=0.4:offset=5.6[x01]",
        "[x01][v2]xfade=transition=wipeleft:duration=0.4:offset=11.2[x02]",
        "[x02][v3]xfade=transition=fade:duration=0.4:offset=16.8[x03]",
        "[x03][v4]xfade=transition=fade:duration=0.4:offset=22.4[x04]",
        "[x04][v5]xfade=transition=fade:duration=0.25:offset=28.15[vout]",
    ].join(";");
    const code = await ffmpeg.exec([
        "-i", "input-0.mp4", "-i", "input-1.mp4", "-i", "input-2.mp4", "-i", "input-3.mp4", "-i", "input-4.mp4", "-i", "input-5.mp4",
        "-filter_complex", filter, "-map", "[vout]", "-r", "24", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "frost-oath-final.mp4",
    ]);
    if (code !== 0) throw new Error(`编码失败（${code}）`);
    const data = await ffmpeg.readFile("frost-oath-final.mp4");
    const url = URL.createObjectURL(new Blob([data as Uint8Array], { type: "video/mp4" }));
    preview.src = url;
    preview.style.display = "block";
    download.href = url;
    download.download = "霜誓-完整成片-镜头1至6.mp4";
    download.style.display = "inline-block";
    status.textContent = "成片已完成。请预览并下载。";
    progress.value = 100;
}

render().catch((error) => { status.textContent = `导出失败：${error instanceof Error ? error.message : String(error)}`; });

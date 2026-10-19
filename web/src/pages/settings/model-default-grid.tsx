import { AudioLines, Check, Film, Image, MessageSquareText } from "lucide-react";

import { ModelIcon } from "@/components/model-picker";
import { cn } from "@/lib/utils";
import {
    filterModelsByCapability,
    modelDisplayName,
    modelOptionName,
    resolveModelChannel,
    type AiConfig,
    type ModelCapability,
} from "@/stores/use-config-store";
import { useUserStore } from "@/stores/use-user-store";

type DefaultModelKey = "imageModel" | "videoModel" | "textModel" | "audioModel";

const groups: Array<{
    capability: ModelCapability;
    modelKey: DefaultModelKey;
    title: string;
    description: string;
    icon: typeof Image;
}> = [
    { capability: "image", modelKey: "imageModel", title: "默认生图模型", description: "图片生成、图像编辑与视觉探索", icon: Image },
    { capability: "video", modelKey: "videoModel", title: "默认视频模型", description: "文生视频、图生视频与镜头延展", icon: Film },
    { capability: "text", modelKey: "textModel", title: "默认文本模型", description: "提示词改写、脚本与结构化文本", icon: MessageSquareText },
    { capability: "audio", modelKey: "audioModel", title: "默认音频模型", description: "语音、音效与音乐生成", icon: AudioLines },
];

export function ModelDefaultGrid({ config, onChange }: { config: AiConfig; onChange: (key: DefaultModelKey, model: string) => void }) {
    const creditsEnabled = useUserStore((state) => state.features.creditsEnabled);
    return (
        <div className="space-y-1">
            {groups.map((group) => {
                const models = filterModelsByCapability(config.models, group.capability, config.channels);
                const Icon = group.icon;
                const modelSections = group.capability === "audio" ? splitAudioModels(models) : [{ title: "", models }];
                return (
                    <section key={group.capability} className="py-5 first:pt-0 last:pb-0" aria-labelledby={`default-${group.capability}-title`}>
                        <div className="mb-3 flex items-start gap-3">
                            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-active text-foreground/65"><Icon className="size-4" /></span>
                            <div className="min-w-0">
                                <h3 id={`default-${group.capability}-title`} className="text-sm font-semibold">{group.title}</h3>
                                <p className="mt-0.5 text-xs text-foreground/48">{group.description}</p>
                            </div>
                            <span className="ml-auto shrink-0 text-xs tabular-nums text-foreground/38">{models.length} 个可用</span>
                        </div>
                        {models.length ? (
                            <div className="space-y-4">
                                {modelSections.map((section) => (
                                    <div key={section.title || group.capability}>
                                        {section.title ? <p className="mb-2 text-xs font-medium text-foreground/60">{section.title}</p> : null}
                                        <div role="radiogroup" aria-label={section.title || group.title} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {section.models.map((model) => {
                                    const channel = resolveModelChannel(config, model);
                                    const selected = config[group.modelKey] === model;
                                    const cost = channel.modelCosts?.find((item) => item.model === modelOptionName(model));
                                    return (
                                        <button
                                            key={model}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            className={cn(
                                                "model-default-option group relative overflow-hidden rounded-md px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                                                selected && "is-selected",
                                            )}
                                            onClick={() => onChange(group.modelKey, model)}
                                        >
                                            <span className="flex min-w-0 items-start gap-2.5">
                                                <span className="model-default-option-icon grid size-8 shrink-0 place-items-center rounded-md">
                                                    <ModelIcon config={config} model={model} />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-xs font-semibold">{modelDisplayName(config, model)}</span>
                                                    <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[var(--fs-tiny)] text-foreground/45">
                                                        <span className="max-w-full truncate">{modelChannelLabel(channel.name, modelOptionName(model), group.capability)}</span>
                                                        <span className="model-default-option-scope">{channel.scope === "system" ? "系统" : "自定义"}</span>
                                                        {group.capability === "audio" ? <span className="model-default-option-scope">{audioModelKind(modelOptionName(model))}</span> : null}
                                                        {creditsEnabled && cost ? <span className="model-default-price">{formatPrice(cost.billingMode === "token" ? (cost.outputTokenPriceMicrocredits || 0) : cost.unitPriceMicrocredits)} /{cost.billingMode === "token" ? "百万 Token" : cost.billingMode === "per_second" ? "秒" : "次"}</span> : null}
                                                    </span>
                                                </span>
                                                <span className={cn("model-default-option-check grid size-5 shrink-0 place-items-center rounded-full", selected ? "is-selected" : "text-transparent")}>
                                                    <Check className="size-3" strokeWidth={2.5} />
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-md bg-surface-active px-4 py-6 text-center text-xs text-foreground/45">当前渠道中没有可用的{capabilityLabel(group.capability)}模型</div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

function splitAudioModels(models: string[]) {
    const sections = ["语音合成", "音乐生成", "音色复刻", "音色设计", "其他音频"];
    return sections.map((title) => ({ title, models: models.filter((model) => audioModelKind(modelOptionName(model)) === title) })).filter((section) => section.models.length);
}

function audioModelKind(model: string) {
    const normalized = model.toLowerCase();
    if (normalized === "voice_clone") return "音色复刻";
    if (normalized === "voice_design") return "音色设计";
    if (normalized.startsWith("music-")) return "音乐生成";
    if (normalized.startsWith("speech-") || normalized.includes("tts")) return "语音合成";
    return "其他音频";
}

function modelChannelLabel(channelName: string, model: string, capability: ModelCapability) {
    // A channel may have been named “MiniMax-文本” before media products were
    // added. Its name should not make video or audio cards look misclassified.
    if (/^(minimax-|speech-|music-|voice_(clone|design)$)/i.test(model)) {
        const kind = capability === "audio" ? audioModelKind(model) : capability === "video" ? "视频生成" : "文本";
        return `MiniMax · ${kind}`;
    }
    return channelName || "未命名渠道";
}

function capabilityLabel(capability: ModelCapability) {
    return { image: "图片", video: "视频", text: "文本", audio: "音频" }[capability];
}

function formatPrice(microcredits: number) {
    return (microcredits / 1_000_000).toLocaleString("zh-CN", { maximumFractionDigits: 6 });
}

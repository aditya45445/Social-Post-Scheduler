import { useEffect, useState } from "react"
import { PLATFORMS } from "../assets/assets"
import { ArrowRightIcon, Calendar1Icon, ClockIcon, HistoryIcon, Loader2Icon, TimerIcon, Wand2Icon, XIcon } from "lucide-react"
import api from "../api/axiox"
import toast from "react-hot-toast"

const GenerationSkeleton = () => {
    return (
        <>
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5 animate-pulse"
                >
                    <div className="flex flex-col space-y-4">

                        {/* Top row */}
                        <div className="flex justify-between items-center gap-2">
                            <div className="h-3 w-28 bg-slate-200 rounded" />
                            <div className="h-5 w-16 bg-slate-200 rounded-md" />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-slate-200 rounded" />
                            <div className="h-3 w-5/6 bg-slate-200 rounded" />
                            <div className="h-3 w-4/6 bg-slate-200 rounded" />
                        </div>

                        {/* Image placeholder */}
                        <div className="w-full aspect-video bg-slate-200 rounded-xl" />

                        {/* Button */}
                        <div className="pt-2 border-t border-slate-100">
                            <div className="h-8 w-full bg-slate-200 rounded-lg" />
                        </div>

                    </div>
                </div>
            ))}
        </>
    )
}

const AIComposer = () => {

    const [prompt, setPrompt] = useState("")
    const [tone, setTone] = useState("Professional")
    const [generateImage, setGenerateImage] = useState(false)
    const [loading, setLoding] = useState(false)
    const [generations, setGenerations] = useState<any[]>([])
    const [generationLoading, setGenerationLoading] = useState(true)

    // scheduling states
    const [activeScheduler, setActiveScheduler] = useState<any>(null)
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
    const [scheduleDate, setScheduleDate] = useState("")
    const [scheduleTime, setScheduleTime] = useState("")
    const [scheduling, setScheduling] = useState(false)

    const fetchGeneration = async () => {
        try {
            const { data } = await api.get("/api/post/generations")
            setGenerations(data)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setGenerationLoading(false)
        }
    }

    const tones = ["Professional", "Casual", "Witty", "Inspirational", "Empathetic"]

    useEffect(() => {
        fetchGeneration()
    }, [])

    const handleGenerate = async () => {
        if (!prompt) {
            toast.error("Please enter a prompt")
            return
        }
        setLoding(true)
        try {
            const { data } = await api.post("/api/post/generate", { prompt, tone, generateImage })

            const generation = data.generation || data;
            setGenerations((prev) => [generation, ...prev])
            setActiveScheduler(generation)
            toast.success("Post generated successfully")
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoding(false)
        }
    }

    const handleSchedule = async () => {
        if (!activeScheduler.content?.trim()) {
            toast.error("Generated post content is missing");
            return;
        }
        if (selectedPlatforms.length === 0) {
            toast.error("Select at least one platform")
            return
        }
        if (!scheduleDate) {
            toast.error("Select schedule date")
            return
        }
        if (!scheduleTime) {
            toast.error("Select schedule time")
            return
        }

        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
        setScheduling(true)
        try {
            await api.post("/api/post/schedule", {
                content: activeScheduler.content,
                mediaUrl: activeScheduler.mediaUrl,
                platforms: selectedPlatforms,
                mediaType: activeScheduler.mediaType,
                scheduledFor,
                status: "scheduled"

            })
            toast.success("AI-Post scheduled successfully!")
            setActiveScheduler(null)
            setScheduleDate("")
            setScheduleTime("")
            setSelectedPlatforms([])
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to Schedule!")
        } finally {
            setScheduling(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in zoom-in duration-500">
            {/* input SEction  */}
            <div className="space-y-6 text-center mt-20">
                <h1 className="text-3xl text-slate-700 tracking-tight">
                    What should we create today?
                </h1>
                <div className="relative group mt-12">
                    <textarea required id="prompt" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the content you want to create... (e.g. A post about the launch of our new eco-friendly coffee beans"
                        className="w-full px-6 py-5 bg-white border border-slate-200 rounded-xl outline-none text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 shadow-sm transition resize-none h-40" />
                    <div className="absolute right-3 bottom-4 text-sm text-slate-500 font-medium flex items-center gap-3">
                        <button onClick={() => setGenerateImage(!generateImage)} className="flex items-center gap-3 bg-red-50 py-2 px-3 rounded-lg">
                            <span className="">
                                AI Image
                            </span>
                            <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${generateImage ? "bg-red-500" : "bg-slate-200"}`}>
                                <span className={`pointer-event-none size-4 transform translate-y-0.5 rounded-full bg-white transition ${generateImage ? "translate-x-4" : "translate-x-0.5"}`} />
                            </div>
                        </button>

                        <button disabled={loading} onClick={handleGenerate}
                            className="bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg" type="button" >
                            {loading ? (
                                <>
                                    <Loader2Icon className="size-5 animate-spin" />
                                    <span className="ml-2 text-red-500">Generating...</span>
                                </>
                            ) : (
                                <>
                                    <span className="ml-2">Generate</span>
                                    <ArrowRightIcon className="size-5" />
                                </>
                            )}

                        </button>

                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    {tones.map((t) => (
                        <button type="button" onClick={() => setTone(t)} key={t}
                            className={`py-2 px-4 rounded-full text-sm transition-all border
                        ${tone === t ? "bg-red-500 border-red-500 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700"}`}>
                            {t}</button>
                    ))}
                </div>
            </div>

            {/* AI generated Posts */}
            <div className="space-y-6 pt-12 border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-2">
                        <HistoryIcon className="size-5" />
                        <h2 className="font-semibold text-xl">Recent generations</h2>
                    </div>
                    {generationLoading ? (
                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    ) : (
                        <span className="text-sm text-slate-500">
                            {generations.length} Total Posts
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {generationLoading ? (
                        <GenerationSkeleton />
                    ) : (
                        <>
                            {generations.map((gen) => (
                                <div
                                    key={gen.id || gen._id}
                                    className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-red-200 p-5 hover:shadow-md"
                                >
                                    <div className="flex flex-col h-full space-y-4">

                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-sm text-slate-400 uppercase tracking-wider">
                                                {gen.createdAt
                                                    ? new Date(gen.createdAt).toLocaleString()
                                                    : ""}
                                            </span>

                                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                                                {gen.tone}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-600 line-clamp-3 flex-1 leading-relaxed">
                                            {gen.content}
                                        </p>

                                        {gen.mediaUrl && (
                                            <div className="rounded-xl overflow-hidden border border-slate-50 bg-slate-100">
                                                <img
                                                    src={gen.mediaUrl}
                                                    alt="Generated"
                                                    className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                            <button
                                                onClick={() => setActiveScheduler(gen)}
                                                className="flex-1 bg-slate-200 hover:bg-red-400 text-slate-700 hover:text-white text-xs font-medium px-2 py-2 rounded-lg transition-colors"
                                            >
                                                Schedule Post
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))}

                            {generations.length === 0 && (
                                <div className="col-span-full py-20 text-center space-y-2">
                                    <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 mx-auto">
                                        <Wand2Icon className="size-6" />
                                    </div>

                                    <p className="text-slate-400 text-sm">
                                        No content generated yet. Try generating some content using the AI
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>

            {/* Scheduler  Modal*/}

            {activeScheduler && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh] border border-slate-200 animate-in zoom-in-95 duration-300">

                        {/* Header */}
                        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                            <div>
                                <h3 className="font-semibold text-slate-800 text-lg">
                                    Schedule Generation
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Review your content before scheduling
                                </p>
                            </div>

                            <button
                                onClick={() => setActiveScheduler(null)}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                <XIcon className="size-5" />
                            </button>
                        </div>

                        {/* SCROLLABLE CONTENT */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-6">

                            {/* Prompt */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                        Your Prompt
                                    </label>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                                        {activeScheduler.prompt}
                                    </p>
                                </div>
                            </div>

                            {/* Generated Content */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                    Generated Content
                                </label>

                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

                                    {/* Content */}
                                    <div className="p-5">
                                        <p className="text-sm leading-7 whitespace-pre-wrap text-slate-800">
                                            {activeScheduler.content}
                                        </p>
                                    </div>

                                    {/* Image */}
                                    {activeScheduler.mediaUrl && (
                                        <div className="px-5 pb-5">
                                            <img src={activeScheduler.mediaUrl} alt="Generated preview"
                                                className="w-full max-h-[320px] rounded-xl object-cover border border-slate-200"
                                            />
                                        </div>
                                    )}

                                </div>
                            </div>

                        </div>

                        {/* OPTIONS */}
                        <div className="shrink-0 p-6 sm:p-8 bg-slate-50/70 border-t border-slate-100 space-y-6">

                            {/* Select Channel */}
                            <div>
                                <label className="font-semibold text-slate-800 block uppercase tracking-widest mb-3 text-xs">
                                    Select Channel
                                </label>

                                <div className="flex flex-wrap gap-2">
                                    {PLATFORMS.map((p) => {
                                        const active = selectedPlatforms.includes(p.id);

                                        return (
                                            <button key={p.id} type="button"
                                                onClick={() => setSelectedPlatforms((prev) => prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id])}
                                                className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${active ? "bg-red-500 border-red-500 text-white shadow-md" : "bg-white border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 hover:shadow-sm"}`}
                                            >
                                                <p.icon className="size-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Date */}
                                <div>
                                    <label htmlFor="date" className="block mb-2 text-sm font-medium text-slate-700">
                                        Schedule Date
                                    </label>

                                    <div className="relative">
                                        <Calendar1Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />

                                        <input type="date" id="date" value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-slate-800 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Time */}
                                <div>
                                    <label
                                        htmlFor="time"
                                        className="block mb-2 text-sm font-medium text-slate-700"
                                    >
                                        Schedule Time
                                    </label>

                                    <div className="relative">
                                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />

                                        <input
                                            type="time"
                                            id="time"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-slate-800 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Schedule Button */}
                            <button
                                onClick={handleSchedule}
                                disabled={scheduling}
                                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                {scheduling ? (
                                    <>
                                        <Loader2Icon className="size-4 animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <TimerIcon className="size-4" />
                                        Schedule Posts
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

export default AIComposer
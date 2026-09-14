import { useState, useEffect } from "react";
import { PLATFORMS } from "../assets/assets";
import { ArrowRightIcon, Calendar1Icon, ClockIcon, SendIcon, XIcon } from "lucide-react";
import api from "../api/axiox";
import toast from "react-hot-toast";

const Scheduler = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [content, setContent] = useState("")
    const [scheduleDate, setScheduleDate] = useState("")
    const [scheduleTime, setScheduleTime] = useState("")
    const [selectedPlatform, setSelectedPlatform] = useState<string[]>([])
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchPosts = async () => {
        try {
            setPostsLoading(true);
            const { data } = await api.get("/api/post")
            setPosts(Array.isArray(data) ? data : [])
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setPostsLoading(false);
        }
    }

    useEffect(() => {
        (async () => await fetchPosts())()
        const interval = setInterval(async () => {
            await fetchPosts();
        }, 10000)
        return () => clearInterval(interval)
    }, [])

    const scheduled = posts.filter((p) => p.status === "scheduled")
    const published = posts.filter((p) => p.status === "published")

    const togglePlatform = (id: string) => {
        setSelectedPlatform((prev) =>
            (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
    }

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPlatform.length === 0) {
            toast.error("Please select at least one platform")
            return
        }
        if (content.length === 0) {
            toast.error("Please enter content")
            return
        }
        if (!scheduleDate || !scheduleTime) {
            toast.error("Please enter schedule date and time")
            return
        }
        if (selectedPlatform.includes('instagram') && !mediaFile) {
            toast.error("Please upload media for Instagram")
            return
        }
        const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()

        const formData = new FormData()
        formData.append("content", content)
        formData.append("scheduledFor", scheduledFor)
        formData.append("status", "scheduled")
        formData.append("platforms", JSON.stringify(selectedPlatform))
        if (mediaFile) {
            formData.append("media", mediaFile)
        }
        setLoading(true)
        try {
            await api.post("/api/post/schedule", formData)
            toast.success("Post scheduled successfully")
            setContent("")
            setScheduleDate("")
            setScheduleTime("")
            setSelectedPlatform([])
            setMediaFile(null)
            fetchPosts()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">

            <div className="w-full lg:w-[460px] shrink:0">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-lg text-slate-700">Compose Post</h2>
                    </div>
                    <form className="space-y-5" onSubmit={handleSchedule} >
                        {/* Platform Selection */}
                        <div className="">
                            <label htmlFor="platform" className="block text-xs text-slate-500 uppercase mb-2">Platform
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORMS.map((p) => {
                                    const active = selectedPlatform.includes(p.id);
                                    return (
                                        <button key={p.id} type="button" onClick={() => togglePlatform(p.id)} className={`flex items-center gap-1.5 p-3 rounded-md border transition-all duration-150 ${active ? "border-blue-500 bg-red-50 text-red-600 scale-105" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}>
                                            <p.icon className="size-4.5 " />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="">
                            <label htmlFor="content" className="block text-xs text-slate-500 uppercase mb-2">Content</label>
                            <textarea required id="content" rows={5} placeholder="What do you want to share today?" value={content} onChange={(e) => setContent(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 placeholder-slate-400 resize-none" />
                            <div className={`text-right text-xs mt-1 font-medium ${content.length > 280 ? "text-red-500" : "text-slate-400"}`}>
                                {content.length}/280
                            </div>
                        </div>

                        {/* Media Upload */}
                        <div className="">
                            <label htmlFor="media" className="block text-xs text-slate-500 uppercase mb-2">Media(Optional)</label>
                            {mediaFile ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                    {mediaFile.type.startsWith("image/") ?
                                        <img src={URL.createObjectURL(mediaFile)} alt="media" className="w-full h-40 object-cover" />
                                        :
                                        <video src={URL.createObjectURL(mediaFile)} className="w-full h-40 object-cover" controls />
                                    }
                                    <button type="button" onClick={() => setMediaFile(null)} className="absolute top-2 right-2 size-7 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full flex items-center justify-center transition-colors">
                                        <XIcon className="size-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="media" className="flex items-center justify-center gap-2 p-5 py-10 border-2 border-dashed rounded-xl border-slate-300 text-slate-400 hover:border-red-400 hover:text-slate-500 hover:bg-red-50/30 cursor-pointer transition-all group">
                                    <span className="text-sm text-slate-500 group-hover:text-red-600 group-hover:text-slate-900 transition-colors">Click to upload image or video</span>
                                    <input id="media" type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
                                </label>
                            )}
                        </div>

                        {/* Schedule Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-2">Date</label>
                                <div className="relative">
                                    <Calendar1Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                    <input type="date" required value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 uppercase mb-2">Time</label>
                                <div className="relative">
                                    <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                                    <input type="time" required value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full rounded-lg bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800" />
                                </div>
                            </div>
                        </div>

                        {/* Submit button */}

                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 text-white py-3 font-medium hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                            {loading ? (
                                <>
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-2 text-white">Scheduling...</span>
                                </>
                            ) : (
                                <>
                                    Schedule Post
                                    <ArrowRightIcon className="size-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Queue Panel */}

            <div className="flex-1 flex flex-col gap-6 min-w-0">
                {/* Upcoming */}

                <div className="bg-white border rounded-2xl border-slate-200 overflow-hidden ">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-medium text-slate-700 flex items-center gap-2">
                        <Calendar1Icon className="size-4 text-slate-500" />
                        <h3 className="text-slate-900 text-sm">Upcoming</h3>
                        <span className="ml-auto text-sm font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                            {postsLoading ? (
                                <div className="h-4 w-5 bg-slate-200 rounded animate-pulse" />
                            ) : (
                                scheduled.length
                            )}
                        </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {postsLoading ? (
                            <div className="p-5 space-y-4">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="animate-pulse">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex gap-2">
                                                <div className="h-4 w-4 bg-slate-200 rounded" />
                                                <div className="h-4 w-4 bg-slate-200 rounded" />
                                            </div>

                                            <div className="h-4 w-32 bg-slate-200 rounded" />
                                        </div>

                                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : scheduled.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm ">No posts scheduled yet</div>
                        ) : (
                            scheduled.map((post) => (
                                <div key={post._id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {post.platforms.map((p1: string) => {
                                                const meta = PLATFORMS.find((p) => p.id === p1)

                                                if (!meta) return null

                                                const Icon = meta.icon

                                                return (
                                                    <Icon
                                                        key={p1}
                                                        className="size-4 text-slate-700"
                                                    />
                                                )
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {post.mediaType && <span className="text-sm bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md capitalize font-semibold  border border-slate-200">{post.mediaType === "video" ? "video" : "image"}</span>}

                                            <span className="text-sm text-slate-500">{new Date(post.scheduledFor).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 max-w-md">{post.content}</p>
                                </div>
                            ))
                        )}

                    </div>
                </div>

                {/*  Published */}
                <div className="bg-white border rounded-2xl border-slate-200 overflow-hidden ">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 font-medium text-slate-700 flex items-center gap-2">
                        <SendIcon className="size-4 text-slate-500" />
                        <h3 className="text-slate-900 text-sm">Published</h3>
                        <span className="ml-auto text-sm font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">{published.length}</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {published.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-sm ">No posts published yet</div>
                        ) : (
                            published.map((post) => (
                                <div key={post._id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {post.platforms.map((platform: string) => {
                                                const platformData = PLATFORMS.find(
                                                    (p) => p.id === platform
                                                );

                                                if (!platformData) return null;

                                                const Icon = platformData.icon;

                                                return (
                                                    <Icon
                                                        key={platform}
                                                        className="size-4 text-slate-700"
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {post.mediaType && <span className="text-sm bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md capitalize font-semibold  border border-slate-200">{post.mediaType === "video" ? "video" : "image"}</span>}

                                            <span className="text-sm text-slate-500">{new Date(post.updatedAt).toLocaleString()}</span>
                                            <span className="text-xs bg-emerald-50 text-neutral-700 border border-emerald-100 px-2 py-0.5 rounded-full">Published</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 max-w-4/5">{post.content}</p>
                                </div>
                            ))
                        )}

                    </div>
                </div>


            </div>
        </div>
    )
}

export default Scheduler
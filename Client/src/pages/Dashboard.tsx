import { ActivityIcon, CheckCircleIcon, ClockIcon, SendIcon, Share2Icon, TrendingUpIcon, } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axiox";

interface DashboardStats {
    scheduled: number;
    published: number;
    connectedAccounts: number;
}

interface Activity {
    _id: string;
    description: string;
    createdAt: string;
}

// Skeleton for the statistic cards
const StatCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-9 w-16 bg-slate-200 rounded-lg" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
            </div>

            <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
    );
};

// Skeleton for activity rows
const ActivitySkeleton = () => {
    return (
        <div className="divide-y divide-slate-100 animate-pulse">
            {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-4 px-6 py-4">

                    <div className="size-9 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="h-5 w-20 bg-slate-200 rounded-full" />
                            <div className="h-3 w-28 bg-slate-200 rounded" />
                        </div>

                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const [postRes, accountRes, activityRes] =
                    await Promise.all([
                        api.get("/api/post"),
                        api.get("/api/account/get"),
                        api.get("/api/activity"),
                    ]);

                const posts = postRes.data;
                const accounts = accountRes.data.accounts || [];
                const activityLog = activityRes.data.log || [];

                setStats({
                    scheduled: posts.filter((p: any) => p.status === "scheduled").length,
                    published: posts.filter((p: any) => p.status === "published").length,
                    connectedAccounts: accounts.filter((a: any) => a.status === "connected").length,
                });

                setActivities(activityLog);
            } catch (error: any) {
                console.error("Error fetching dashboard data", error);
                setStats({
                    scheduled: 0,
                    published: 0,
                    connectedAccounts: 0,
                });

                setActivities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            label: "Scheduled Posts",
            value: stats?.scheduled ?? 0,
            icon: ClockIcon,
            trend: "+2 today",
        },
        {
            label: "Published Posts",
            value: stats?.published ?? 0,
            icon: CheckCircleIcon,
            trend: "All time",
        },
        {
            label: "Connected Accounts",
            value: stats?.connectedAccounts ?? 0,
            icon: Share2Icon,
            trend: "Active",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl text-slate-900">
                    Good morning!👋
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    Here's what's happening with your social accounts today.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    statCards.map((card) => {
                        return (
                            <div
                                key={card.label}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:bg-red-50 relative hover:border-red-200 transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-3xl font-medium text-slate-800 tabular-nums">
                                        {card.value}
                                    </div>

                                    <div className="text-sm absolute right-4 top-4 text-red-500 flex items-center gap-1">
                                        <TrendingUpIcon className="size-3" />
                                        {card.trend}
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 mt-1">
                                    {card.label}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-slate-900">
                        Recent Activity
                    </h2>

                    {loading ? (
                        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    ) : (
                        <span className="text-xs text-slate-500">
                            {activities?.length ?? 0} events
                        </span>
                    )}
                </div>

                {/* Loading */}
                {loading ? (
                    <ActivitySkeleton />
                ) : activities && activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <div className="rounded-xl bg-slate-100 p-3 flex items-center justify-center mb-3">
                            <ActivityIcon className="size-6 text-slate-400" />
                        </div>

                        <p className="text-slate-500">
                            No Activity yet
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            Connect accounts and schedule posts to see events here.
                        </p>
                    </div>
                ) : (
                    /* Actual activity */
                    <div className="divide-y divide-slate-100">
                        {activities?.map((activity) => (
                            <div
                                key={activity._id}
                                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                            >
                                <div className="size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-zinc-100 text-zinc-600">
                                    <SendIcon className="size-4.5 text-slate-500" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-sm px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                                            Published
                                        </span>

                                        <span className="text-xs text-slate-500 shrink-0">
                                            {new Date(
                                                activity.createdAt
                                            ).toLocaleString()}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-600">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

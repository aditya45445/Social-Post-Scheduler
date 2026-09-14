import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { PLATFORMS } from "../assets/assets";
import AccountList from "../components/Home/AccountList";
import PlatformPickerModal from "../components/Home/PlatformPickerModal";
import toast from "react-hot-toast";
import api from "../api/axiox";

const AccountListSkeleton = () => {
    return (
        <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="bg-white border border-slate-200 rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-11 rounded-xl bg-slate-200" />

                            <div className="space-y-2">
                                <div className="h-4 w-28 bg-slate-200 rounded" />
                                <div className="h-3 w-36 bg-slate-200 rounded" />
                            </div>
                        </div>

                        <div className="h-8 w-24 bg-slate-200 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const Accounts = () => {

    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<string | null>(null);
    const [showPlatformPicker, setShowPlatformPicker] = useState(false);
    const connectedIds = accounts.map((account) => account.platform);

    const fetchAccount = async (isSync = false, platform?: string | null, successMsg?: string) => {
        try {
            if (isSync) {
                const label =
                    platform
                        ? platform.charAt(0).toUpperCase() + platform.slice(1)
                        : "Social Media";
                toast.loading(`Syncing ${label} account...`, { id: "sync" });
                await api.get("/api/social/sync");
                toast.success(successMsg || "Account synced!", { id: "sync" });
            }

            const { data } = await api.get("/api/account/get");

            setAccounts(data.accounts || []);

        } catch (error: any) {
            console.error("Error fetching accounts:", error);

            toast.error(error.response?.data?.message || error?.message || "Failed to load accounts");

            setAccounts([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const connectedPlatform = params.get("connected");
        const connectedUsername = params.get("username");
        const syncNeeded = params.get("sync") === "true";
        const errorMsg = params.get("error");

        window.history.replaceState({}, document.title, window.location.pathname);

        if (connectedPlatform) {
            const label = connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1);
            const handle = connectedUsername ? `(@${connectedUsername})` : "";
            fetchAccount(true, connectedPlatform, `${label}${handle} connected!`);

        } else if (errorMsg) {
            toast.error(`Connection failed: ${decodeURIComponent(errorMsg)}`);
            fetchAccount();

        } else if (syncNeeded) {
            fetchAccount(true, null, "Accounts synced!");

        } else {
            fetchAccount();
        }
    }, []);

    const handleConnect = async (platformId: string) => {
        setConnecting(platformId);

        try {
            const { data } = await api.get(`/api/social/${platformId}/url`);

            window.location.href = data.url;
        } catch (error: any) {
            setConnecting(null);

            toast.error(
                error.response?.data?.message ||
                error?.message ||
                `Failed to connect ${platformId}`
            );
        }
    };

    const handleDisconnect = async (accountId: string) => {
        try {
            await api.delete(`/api/account/disconnect/${accountId}`);

            toast.success("Account disconnected");
            await fetchAccount();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                error?.message ||
                "Failed to disconnect account"
            );
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                <div>
                    <h2 className="text-xl text-slate-900">
                        Connected Accounts
                    </h2>

                    {loading ? (
                        <div className="h-4 w-48 bg-slate-200 rounded mt-2 animate-pulse" />
                    ) : (
                        <p className="text-slate-500 text-sm mt-0.5">
                            {accounts.length} of {PLATFORMS.length} platforms connected
                        </p>
                    )}
                </div>

                <button
                    onClick={() =>
                        setShowPlatformPicker(true)
                    }
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all w-full sm:w-auto justify-center"
                >
                    <PlusIcon className="size-4" />
                    Connect Account
                </button>
            </div>

            {/* Platform Picker */}
            {showPlatformPicker && (
                <PlatformPickerModal connectedIds={connectedIds} connecting={connecting} onClose={() => setShowPlatformPicker(false)} onConnect={handleConnect} />
            )}

            {/* Accounts */}
            {loading ? (
                <AccountListSkeleton />
            ) : (
                <AccountList accounts={accounts} onDisconnect={handleDisconnect} />
            )}

        </div>
    );
};

export default Accounts;

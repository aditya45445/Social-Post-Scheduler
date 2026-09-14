import { CheckCircleIcon, ExternalLinkIcon, XIcon } from "lucide-react";
import { PLATFORMS } from "../../assets/assets"

interface PlatformPickerModalProps {
    connectedIds: string[];
    connecting: string | null;
    onClose: () => void
    onConnect: (platformId: string) => Promise<void>
}

const PlatformPickerModal = ({ connectedIds, connecting, onClose, onConnect }: PlatformPickerModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur  ">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-xl font-medium text-slate-800">Choose a Platform</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-2 hover:bg-slate-100 transition-all">
                        <XIcon className="size-4" />
                    </button>
                </div>
                <div className="p-6 flex flex-col  gap-2">
                    {PLATFORMS.map((p) => {
                        const isConnected = connectedIds.includes(p.id);
                        const isConnecting = connecting === p.id
                        return (
                            <button key={p.id} disabled={isConnected || isConnecting} onClick={() => onConnect(p.id)} className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${isConnected ? 'border-red-200 bg-red-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'} ${isConnecting && "opacity-55"}`}>
                                <div className="p-2">
                                    <p.icon className={`size-5 ${isConnected ? 'text-red-600' : 'text-slate-600'}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm ${isConnected ? 'text-red-700' : 'text-slate-900'}`}>
                                        {p.name}
                                    </div>
                                    <div className="text-sm text-slate-500 truncate">
                                        {isConnected ? 'Already Connected' : p.description}
                                    </div>
                                </div>

                                {isConnected && <CheckCircleIcon className="size-5 text-red-600 shrink-0" />}
                                {isConnecting && <div className="size-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0" />}
                                {!isConnected && !isConnecting && <ExternalLinkIcon className="size-5 text-slate-400 hover:text-slate-600 shrink-0" />}
                            </button>
                        )
                    })}


                </div>
            </div>
        </div>
    )
}

export default PlatformPickerModal
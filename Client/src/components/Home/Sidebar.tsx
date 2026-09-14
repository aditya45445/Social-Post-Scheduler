import { CalendarDaysIcon, LayoutDashboardIcon, LogOut, UsersIcon, Wand2Icon } from 'lucide-react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {

    const { logout, user } = useAuth()

    const location = useLocation()

    const navItems = [
        { name: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
        { name: "Accounts    ", icon: UsersIcon, path: "/accounts" },
        { name: "AI Composer", icon: CalendarDaysIcon, path: "/ai-composer" },
        { name: "Scheduler", icon: Wand2Icon, path: "/scheduler" },

    ]
    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative flex flex-col h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className='p-6 pb-4'>
                <Link to="/" onClick={() => setIsOpen(false)}
                    className="text-xl tracking-tight text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                    <img src="/logo.svg" alt="logo" className="w-12 h-12" /> Scheduler
                </Link>
            </div>

            <div className='px-6 py-2'>
                <span className='text-sm tracking-wider text-slate-500 uppercase'>Menu</span>
            </div>

            <nav className='flex-1 px-4 space-y-2 '>
                {
                    navItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink key={item.name} to={item.path} end={item.path === "/dashboard"}
                                onClick={() => setIsOpen(false)}
                                className={`py-2 px-4 rounded flex items-center text-sm  gap-3 transition-all duration-150 border ${isActive ? 'bg-red-50 border-red-200 text-red-600' : 'text-slate-500 hover:bg-slate-50 border-transparent hover:text-slate-700'
                                    }`}>
                                <item.icon className={`size-4.5 shrink-0 ${isActive ? 'text-red-900' : 'text-slate-500'}`} />
                                {item.name}
                                {isActive && <span className='ml-auto w-[5px] h-5 rounded-full bg-red-600' />}
                            </NavLink>
                        )
                    })
                }
            </nav>

            <div className='px-6 py-4 border-t border-slate-200'>
                <div className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors'>
                    <div className='size-8 rounded-full bg-linear-to-br from-blue-500 to-red-600 flex items-center justify-center text-white font-bold text-sm font-medium shrink-0'>
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <div className='font-medium  text-sm text-slate-900 truncate'>
                            {user?.username || "User"}
                        </div>
                        <div className='text-xs text-slate-400 truncate'>
                            {user?.email || "User"}
                        </div>
                    </div>
                </div>
                <button onClick={() => logout()} className='flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 mt-1 w-full '>
                    <LogOut className="size-4" />
                    Logout
                </button>

            </div>


        </div>
    )
}

export default Sidebar
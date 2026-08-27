import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tabClass = ({ isActive }) =>
        `flex-shrink-0 text-sm font-medium pb-2 border-b-2 transition ${
            isActive ? 'text-purple-700 border-purple-600' : 'text-gray-500 border-transparent hover:text-purple-600'
        }`;

    return (
        <header className="border-b bg-white sticky top-0 z-40">
            <nav className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
                    <Link to={'/'} className="min-w-0">
                        <h1 className="text-red-900 font-bold text-sm sm:text-lg md:text-2xl cursor-pointer tracking-wide truncate">
                            What Lenka is wearing today
                        </h1>
                    </Link>
                    {user && (
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <span className="hidden sm:inline text-sm text-gray-500">{user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-xs sm:text-sm text-gray-500 hover:text-red-900 transition"
                            >
                                Log out
                            </button>
                        </div>
                    )}
                </div>

                {user && (
                    <div className="flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar -mb-px">
                        <NavLink to="/pinterest" className={tabClass}>Pinterest</NavLink>
                        <NavLink to="/wardrobe" className={tabClass}>Wardrobe</NavLink>
                        <NavLink to="/archetypes" className={tabClass}>Archetypes</NavLink>
                        <NavLink to="/collections" className={tabClass}>Collections</NavLink>
                        <NavLink to="/manage" className={tabClass}>Manage</NavLink>
                    </div>
                )}
            </nav>
        </header>
    );
}

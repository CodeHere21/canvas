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
        `text-sm font-medium transition ${
            isActive ? 'text-purple-700 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'
        } pb-1`;

    return (
        <header className="border-b">
            <nav className="flex items-center justify-between h-20 max-w-6xl mx-auto px-5">
                <Link to={'/'}>
                    <h1 className="text-red-900 font-bold text-lg sm:text-xl md:text-2xl cursor-pointer tracking-wide">
                        What Lenka is wearing today
                    </h1>
                </Link>

                {user && (
                    <div className="flex items-center gap-5">
                        <NavLink to="/wardrobe" className={tabClass}>Wardrobe</NavLink>
                        <NavLink to="/archetypes" className={tabClass}>Archetypes</NavLink>
                        <NavLink to="/collections" className={tabClass}>Collections</NavLink>
                        <NavLink to="/manage" className={tabClass}>Manage</NavLink>
                        <div className="flex items-center gap-3 pl-2">
                            <span className="text-sm text-gray-500">{user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-500 hover:text-red-900 transition"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

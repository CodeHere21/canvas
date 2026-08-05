import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/header';
import Login from './pages/login';
import Wardrobe from './pages/wardrobe';
import Archetypes from './pages/archetypes';
import Collections from './pages/collections';
import CollectionDetail from './pages/collectionDetail';
import Manage from './pages/manage';
import { AuthProvider } from './features/auth/AuthContext';
import RequireAuth from './features/auth/RequireAuth';

function AppRoutes() {
    return (
        <div>
            <Header />
            <Routes>
                <Route path="/" element={<Navigate to="/wardrobe" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/wardrobe" element={<RequireAuth><Wardrobe /></RequireAuth>} />
                <Route path="/archetypes" element={<RequireAuth><Archetypes /></RequireAuth>} />
                <Route path="/collections" element={<RequireAuth><Collections /></RequireAuth>} />
                <Route path="/collections/:id" element={<RequireAuth><CollectionDetail /></RequireAuth>} />
                <Route path="/manage" element={<RequireAuth><Manage /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/wardrobe" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;

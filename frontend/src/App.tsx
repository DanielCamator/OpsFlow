import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginView } from './views/LoginView';

const DashboardView = () => <div className="text-slate-300">Dashboard metrics go here</div>;
const WorkOrdersView = () => <div className="text-slate-300">Work Orders Table goes here</div>;

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { token } = useAuth();
    return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginView />} />
                    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route index element={<DashboardView />} />
                        <Route path="work-orders" element={<WorkOrdersView />} />
                        {/* <Route path="work-orders/:id" element={<WorkOrderDetailView />} /> */}
                        {/* <Route path="work-orders/new" element={<CreateWorkOrderView />} /> */}
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ListView from './screens/ListView';
import DetailView from './screens/DetailView';
import LandingPage from './screens/LandingPage';
import Statistics from './screens/Statistics';
import IndustrializationDecision from './screens/IndustrializationDecision';
import Login from './screens/Login';
import Register from './screens/Register';

import { ProjectsProvider } from './contexts/ProjectsContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/promociones"
              element={
                <ProtectedRoute>
                  <ListView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estadisticas"
              element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/decisor-industrializacion"
              element={
                <ProtectedRoute>
                  <IndustrializationDecision />
                </ProtectedRoute>
              }
            />
            <Route
              path="/details/:projectId"
              element={
                <ProtectedRoute>
                  <DetailView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </ProjectsProvider>
    </AuthProvider>
  );
};

export default App;

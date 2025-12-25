import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setUserFromToken } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token) {
            // Save token and fetch user data
            localStorage.setItem('token', token);

            // Set user from token
            if (setUserFromToken) {
                setUserFromToken(token);
            }

            // Redirect to home or profile
            navigate('/profile');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, setUserFromToken]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xl font-bold text-black">Completing sign in...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;

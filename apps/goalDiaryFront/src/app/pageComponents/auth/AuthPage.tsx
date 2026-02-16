"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="w-full p-6 sm:p-8">
            {isLogin ? (
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
                <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
        </div>
    );
}

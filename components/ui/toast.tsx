"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    success: (message: string) => void;
    error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
    const error = useCallback((message: string) => addToast(message, "error"), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error }}>
            {children}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={`
                pointer-events-auto w-[350px] p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-xl
                ${toast.type === 'success'
                                    ? 'bg-white/90 border-green-100 shadow-green-100/50'
                                    : 'bg-white/90 border-red-100 shadow-red-100/50'
                                }
              `}
                        >
                            <div className={`mt-0.5 p-1.5 rounded-full ${toast.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            </div>
                            <div className="flex-1 pt-0.5">
                                <h4 className={`text-sm font-semibold ${toast.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                                    {toast.type === 'success' ? 'Success' : 'Error'}
                                </h4>
                                <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

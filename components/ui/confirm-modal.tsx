"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-neutral-100 overflow-hidden"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={24} />
                            </div>

                            <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
                            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                                {message}
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

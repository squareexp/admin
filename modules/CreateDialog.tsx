"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Users } from "lucide-react";

interface CreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  handleCreateRoom: (type: "public" | "private") => void;
}

export const CreateDialog: React.FC<CreateDialogProps> = ({
  isOpen,
  onClose,
  handleCreateRoom,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full  bg-dark-800 hover:bg-dark-700 text-gray-400 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={() => handleCreateRoom("public")}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(38, 38, 38, 1)" }}
                className="w-full p-4 rounded-2xl bg-dark-800 border border-transparent hover:border-brand-yellow/50 transition-colors group text-left flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-full  bg-brand-yellow/10 text-brand-yellow flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-black transition-colors">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">New Room</h3>
                  <p className="text-xs text-gray-500">Create a public room</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => handleCreateRoom("private")}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(38, 38, 38, 1)" }}
                className="w-full p-4 rounded-2xl bg-dark-800 border border-transparent hover:border-brand-yellow/50 transition-colors group text-left flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-full  bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">New Private Room</h3>
                  <p className="text-xs text-gray-500">Create a group for your team</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import Icon from "@/components/Icon";

type ConfirmFn = (message: string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

// Promise-based replacement for window.confirm(), styled to match the admin UI
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const resolver = useRef<(value: boolean) => void>(() => {});

  const confirmDialog = useCallback<ConfirmFn>((msg) => {
    setMessage(msg);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    resolver.current(result);
    setMessage(null);
  };

  return (
    <ConfirmContext.Provider value={confirmDialog}>
      {children}
      {message && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          dir="rtl"
          onClick={() => close(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-500">
                <Icon name="delete" className="text-xl" />
              </div>
              <h3 className="text-lg font-extrabold text-primary">تأكيد العملية</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => close(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={() => close(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

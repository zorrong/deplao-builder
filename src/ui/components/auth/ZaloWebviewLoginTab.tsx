import React, { useState } from 'react';
import { ipc } from '../../lib/ipc';

interface ZaloWebviewLoginTabProps {
  onSuccess: () => void;
  proxyId?: number | null;
}

export const ZaloWebviewLoginTab: React.FC<ZaloWebviewLoginTabProps> = ({ onSuccess, proxyId }) => {
  const [status, setStatus] = useState<'idle' | 'opening' | 'waiting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [manualCookies, setManualCookies] = useState<string>('');

  const handleOpenWebview = () => {
    setStatus('waiting');
    setErrorMsg('');
    try {
      if (ipc.shell?.openExternal) {
        ipc.shell.openExternal('https://chat.zalo.me/');
      } else {
        const win = window.open('https://chat.zalo.me/', '_blank');
        if (!win) {
          setErrorMsg('Trình duyệt chặn Pop-up. Vui lòng bấm vào đường liên kết trực tiếp bên dưới.');
        }
      }
    } catch (err: any) {
      console.warn('[ZaloWebviewLoginTab] Error opening webview:', err.message);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCookies.trim()) return;
    setStatus('opening');
    setErrorMsg('');
    try {
      const res = await ipc.login?.loginAuth?.(manualCookies.trim(), proxyId ?? null);
      if (res && res.success) {
        setStatus('success');
        setTimeout(() => onSuccess(), 1000);
      } else {
        setStatus('error');
        setErrorMsg(res?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Auth JSON / Cookie.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Lỗi kết nối khi gửi Cookie');
    }
  };

  return (
    <div className="space-y-5 py-1">
      {/* Thẻ hướng dẫn */}
      <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-xs text-blue-200 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-blue-300">
          <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Đăng nhập Zalo Web (Dự phòng 100% không sợ Checkpoint)
        </div>
        <p className="text-gray-300 leading-relaxed">
          Mở Zalo Web trên trình duyệt để thực hiện đăng nhập và vượt qua các captcha/xác minh của Zalo. Sau đó dán Auth JSON / Cookie thu được vào bên dưới để kích hoạt tài khoản vào Deplao.
        </p>
      </div>

      {status === 'success' ? (
        <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 mx-auto flex items-center justify-center text-xl font-bold">
            ✓
          </div>
          <p className="text-green-300 font-semibold">Đăng nhập Zalo thành công!</p>
          <p className="text-xs text-gray-400">Đang chuẩn bị danh bạ và tin nhắn...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Nút mở Zalo Web bằng cả JS event và HTML Native link */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleOpenWebview}
              className="py-3 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Mở Zalo Web (App)</span>
            </button>

            <a
              href="https://chat.zalo.me/"
              target="_blank"
              rel="noreferrer"
              onClick={() => setStatus('waiting')}
              className="py-3 px-3 bg-gray-700 hover:bg-gray-600 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-gray-600 text-center"
            >
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Link Trực Tiếp Zalo</span>
            </a>
          </div>

          {errorMsg && (
            <div className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Ô dán Auth JSON luôn hiển thị sẵn sàng */}
          <div className="pt-2 space-y-3">
            <label className="block text-xs font-medium text-gray-200">
              Nhập / Dán Auth JSON hoặc Cookie Zalo:
            </label>
            <textarea
              value={manualCookies}
              onChange={(e) => setManualCookies(e.target.value)}
              placeholder='{"imei": "...", "cookies": "...", "userAgent": "..."}'
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-gray-200 font-mono focus:border-blue-500 focus:outline-none leading-relaxed"
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualCookies.trim() || status === 'opening'}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {status === 'opening' ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Đang xác thực Cookie...</span>
                </>
              ) : (
                <span>Xác nhận Đăng nhập Tài Khoản</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

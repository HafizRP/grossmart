import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/Components/UI/Modal';
import { Button } from '@/Components/UI/Button';
import { sound } from '@/Utils/sound';

export interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

interface BarcodeDetectorType {
  detect(image: ImageBitmapSource): Promise<Array<{ rawValue: string }>>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): BarcodeDetectorType;
      getSupportedFormats?(): Promise<string[]>;
    };
  }
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const scanIntervalRef = useRef<number | null>(null);

  // Mulai kamera saat modal dibuka
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setErrorMessage('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Kamera tidak didukung pada browser ini. Silakan ketik barcode manual.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Cek dukungan flashlight/torch
      const track = stream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const capabilities = (track as MediaStreamTrack & { getCapabilities?: () => { torch?: boolean } }).getCapabilities?.();
        if (capabilities && 'torch' in capabilities) {
          setHasTorch(true);
        }
      }

      // Mulai deteksi barcode otomatis
      startBarcodeDetection();
    } catch {
      setErrorMessage('Izin kamera ditolak atau kamera sedang digunakan aplikasi lain.');
      sound.playError();
    }
  };

  const startBarcodeDetection = () => {
    if (typeof window !== 'undefined' && window.BarcodeDetector) {
      try {
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
        });

        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;

          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              const code = barcodes[0].rawValue.trim();
              sound.playBeep();
              onScanSuccess(code);
              onClose();
            }
          } catch {
            // Frame skip
          }
        }, 250);
      } catch {
        // Fallback
      }
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !isTorchOn;
        await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
        sound.playClick();
      } catch {
        // Gagal aktifkan lampu kilat
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      sound.playBeep();
      onScanSuccess(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pemindai Barcode Kamera HP"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Tampilan Viewfinder Kamera */}
        <div className="relative aspect-video sm:aspect-square w-full bg-black rounded-3xl overflow-hidden border-4 border-gray-800 shadow-inner flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Garis Pembidik Barcode (Reticle Viewfinder) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            <div className="relative w-64 h-40 sm:w-72 sm:h-48 border-2 border-emerald-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Garis Merah Laser Bergerak */}
              <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                Arahkan Barcode ke Sini
              </div>
            </div>
          </div>

          {/* Tombol Kontrol Kamera di Atas Layar */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-3 rounded-2xl ${isTorchOn ? 'bg-amber-400 text-gray-950' : 'bg-black/60 text-white'} backdrop-blur-sm cursor-pointer`}
                title="Lampu Kilat / Senter"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
              }}
              className="p-3 rounded-2xl bg-black/60 text-white backdrop-blur-sm cursor-pointer"
              title="Ganti Kamera Depan/Belakang"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-800 text-base font-bold">
            {errorMessage}
          </div>
        )}

        {/* Input Barcode Manual Fallback */}
        <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t-2 border-gray-100">
          <label htmlFor="manual-barcode-input" className="block text-sm font-extrabold text-gray-700">
            Atau Ketik Kode Barcode Secara Manual:
          </label>
          <div className="flex gap-2">
            <input
              id="manual-barcode-input"
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Contoh: 8999999123456"
              className="flex-1 min-h-[50px] px-4 text-lg font-bold border-2 border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              soundFeedback="beep"
              className="px-5 font-black"
            >
              Kirim
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CameraScannerModal;

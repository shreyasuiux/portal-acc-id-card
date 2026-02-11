// CRITICAL: Import warning suppression FIRST (before any other imports)
import './utils/suppressWarnings';

// CRITICAL: Configure ONNX Runtime BEFORE any imports
// This prevents WebAssembly multi-threading warnings
if (typeof window !== 'undefined') {
  (window as any).ort = (window as any).ort || {};
  (window as any).ort.env = (window as any).ort.env || {};
  (window as any).ort.env.wasm = (window as any).ort.env.wasm || {};
  (window as any).ort.env.wasm.numThreads = 1; // Force single thread
  (window as any).ort.env.wasm.simd = true; // Keep SIMD for performance
}

import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import '../styles/index.css';
import '../styles/custom-datepicker.css'; // ⚠️ DEPLOYMENT FIX: Global date picker styles

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right" 
        expand={false} 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Roboto, sans-serif',
          }
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
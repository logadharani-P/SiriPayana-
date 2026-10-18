import { useApp } from '../context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import './Toast.css';

export default function Toast() {
  const { state } = useApp();

  return (
    <AnimatePresence>
      {state.toast && (
        <motion.div
          className={`toast toast--${state.toast.type}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.25 }}
          role="alert"
        >
          <span className="toast__icon">
            {state.toast.type === 'success' ? '✓' : state.toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast__message">{state.toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

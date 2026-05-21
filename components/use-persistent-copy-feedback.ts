'use client';

import { useCallback, useEffect, useId, useState } from 'react';

const COPY_FEEDBACK_EVENT = 'sjg-copy-feedback-change';

let activeCopyFeedbackId: string | null = null;

function setActiveCopyFeedback(id: string | null) {
  activeCopyFeedbackId = id;
  window.dispatchEvent(new CustomEvent<string | null>(COPY_FEEDBACK_EVENT, { detail: id }));
}

export function usePersistentCopyFeedback() {
  const id = useId();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onFeedbackChange = (event: Event) => {
      setCopied((event as CustomEvent<string | null>).detail === id);
    };

    const onPointerDown = () => {
      if (activeCopyFeedbackId === null) return;
      setActiveCopyFeedback(null);
    };

    window.addEventListener(COPY_FEEDBACK_EVENT, onFeedbackChange);
    document.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      window.removeEventListener(COPY_FEEDBACK_EVENT, onFeedbackChange);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [id]);

  const markCopied = useCallback(() => {
    setActiveCopyFeedback(id);
  }, [id]);

  return { copied, markCopied };
}

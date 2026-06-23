'use client';

import { X, ZoomIn } from 'lucide-react';
import { useEffect, useState, type CSSProperties, type ComponentPropsWithoutRef } from 'react';
import { createPortal } from 'react-dom';

function getPreviewMaxWidth(src: string): string | undefined {
  const laceImage = src.match(/^\/images\/lace-(chrome|mobile)\/(?:chrome|mobile)-lace_(\d+)\.(?:png|PNG)$/);
  if (!laceImage) return undefined;

  const [, type, imageNumber] = laceImage;
  const number = Number(imageNumber);

  if (type === 'mobile') {
    return number <= 2 ? '720px' : '360px';
  }

  if (number <= 2) return '720px';
  if (number >= 9) return '420px';

  return undefined;
}

export function MdxImage({ alt = '', className, src, ...props }: ComponentPropsWithoutRef<'img'>) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (typeof src !== 'string') {
    return <img {...props} src={src} alt={alt} className={className} />;
  }

  const previewMaxWidth = getPreviewMaxWidth(src);
  const previewStyle: CSSProperties | undefined = previewMaxWidth
    ? { maxWidth: previewMaxWidth, width: '100%' }
    : undefined;
  const imageStyle: CSSProperties | undefined = previewMaxWidth
    ? { ...props.style, width: '100%', height: 'auto' }
    : props.style;

  return (
    <>
      <button
        type="button"
        className="not-prose group relative my-6 inline-block cursor-zoom-in overflow-hidden rounded-lg border border-fd-border bg-fd-card p-1 transition hover:border-fd-primary/60 hover:shadow-md"
        aria-label={alt ? `${alt}を拡大表示` : '画像を拡大表示'}
        onClick={() => setIsOpen(true)}
        style={previewStyle}
      >
        <img {...props} src={src} alt={alt} className={className} style={imageStyle} />
        <span className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white shadow transition group-hover:bg-black">
          <ZoomIn className="size-4" aria-hidden="true" />
        </span>
      </button>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 overflow-auto bg-black/80 p-4"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative mx-auto flex min-h-full w-max min-w-full items-center justify-center">
                <button
                  type="button"
                  className="fixed right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white transition hover:bg-black"
                  aria-label="拡大画像を閉じる"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-5" />
                </button>
                <img
                  src={src}
                  alt={alt}
                  className="my-8 h-auto max-w-none rounded-lg bg-white"
                  style={{ width: 'min(1300px, 115vw)' }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

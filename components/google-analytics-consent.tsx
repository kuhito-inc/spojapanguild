'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const gaMeasurementId = 'G-R9C48XMXE5';
const storageKey = 'sjg-cookie-consent-analytics';

type ConsentState = 'accepted' | 'unknown';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>('unknown');
  const [loaded, setLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;

      const parsed = JSON.parse(saved) as { analytics?: unknown };
      setAnalyticsEnabled(parsed.analytics !== false);
      setConsent('accepted');
    } catch {
      if (window.localStorage.getItem(storageKey) === 'accepted') {
        setAnalyticsEnabled(true);
        setConsent('accepted');
      }
    }
  }, []);

  useEffect(() => {
    if (consent !== 'accepted' || !analyticsEnabled || !loaded || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: `${pathname}${window.location.search}`,
      page_title: document.title,
    });
  }, [analyticsEnabled, consent, loaded, pathname]);

  const acceptConsent = () => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          analytics: analyticsEnabled,
        }),
      );
    } catch {
      // Keep the in-memory choice even when storage is unavailable.
    }

    setConsent('accepted');
  };

  return (
    <>
      {consent === 'accepted' && analyticsEnabled ? (
        <>
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', { send_page_view: false });
            `}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
            onReady={() => setLoaded(true)}
          />
        </>
      ) : null}

      {consent === 'unknown' ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[3px]" />
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-fd-border bg-fd-background px-5 py-4 shadow-lg sm:py-5">
            <div className="mx-auto grid max-w-5xl gap-4 text-fd-foreground sm:gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-12">
              <div className="min-w-0 space-y-2 md:max-w-3xl sm:space-y-2.5">
                <p className="text-sm font-semibold sm:text-base">Cookieの使用について</p>
                <div className="space-y-1 text-sm leading-relaxed text-fd-muted-foreground sm:text-[0.9375rem]">
                  <p>
                    当サイトでは、ドキュメントの効果測定と利用状況の把握のため、Google Analytics を使用しています。
                  </p>
                  <p>同意すると、分析用 Cookie が有効になります。</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2.5 sm:gap-3 md:items-end md:self-center">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={acceptConsent}
                    className="min-h-10 min-w-28 rounded-md bg-fd-primary px-5 py-2 text-sm font-semibold text-fd-primary-foreground hover:bg-fd-primary/90 sm:min-h-11 sm:py-2.5 sm:text-base"
                  >
                    同意する
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings((value) => !value)}
                    className="min-h-10 min-w-36 rounded-md border border-fd-border px-5 py-2 text-sm font-semibold text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground sm:min-h-11 sm:py-2.5 sm:text-base"
                  >
                    サイトの設定
                  </button>
                </div>
                {showSettings ? (
                  <div className="flex justify-start sm:justify-end">
                    <label className="inline-flex cursor-pointer items-center gap-2.5 py-1 text-sm text-fd-foreground sm:gap-3">
                      <input
                        type="checkbox"
                        checked={analyticsEnabled}
                        onChange={(event) => setAnalyticsEnabled(event.currentTarget.checked)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-fd-muted transition-colors peer-checked:bg-fd-primary/70"
                      >
                        <span className="absolute left-1 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                      </span>
                      <span className="font-medium">Google Analytics</span>
                    </label>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

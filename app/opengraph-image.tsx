import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = 'SPO JAPAN GUILD ドキュメント';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

type CardProps = {
  accent: string;
  description: string;
  logo: 'cardano' | 'midnight' | 'sjg';
  title: string;
};

function Card({ accent, description, logo, title }: CardProps) {
  const isCardano = logo === 'cardano';
  const isMidnight = logo === 'midnight';

  return (
    <div
      style={{
        position: 'relative',
        width: 324,
        height: 246,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #d7dde8',
        borderRadius: 28,
        background: 'rgba(255, 255, 255, 0.86)',
        boxShadow: '0 22px 46px rgba(15, 23, 42, 0.14)',
        padding: '30px 32px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -20,
          bottom: -28,
          width: 140,
          height: 140,
          borderRadius: 999,
          background: 'rgba(37, 99, 235, 0.08)',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: 10,
          height: 38,
          alignItems: 'center',
          color: isCardano ? '#174bb7' : '#111111',
          fontSize: isMidnight ? 30 : 26,
          fontWeight: 900,
        }}
      >
        {isCardano && (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background:
                'radial-gradient(circle, #174bb7 2px, transparent 3px)',
              backgroundSize: '8px 8px',
            }}
          />
        )}
        {isMidnight && (
          <div
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid #111111',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            i
          </div>
        )}
        <div style={{ display: 'flex' }}>
          {isCardano ? 'CARDANO' : isMidnight ? 'midnight' : 'SPO JAPAN GUILD'}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          fontSize: 15,
          fontWeight: 700,
          color: '#525866',
        }}
      >
        {title === 'SPO運用の実践ガイド'
          ? 'Stake pool operations'
          : title === '検証環境の知見を順次整理'
            ? 'Validator testnet'
            : 'Learning materials'}
      </div>

      <div
        style={{
          marginTop: 8,
          display: 'flex',
          fontSize: 22,
          fontWeight: 900,
          color: '#101217',
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 12,
          width: 30,
          height: 4,
          borderRadius: 999,
          background: accent,
        }}
      />

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.55,
          color: '#454b57',
          whiteSpace: 'pre-wrap',
        }}
      >
        {description}
      </div>

      <div
        style={{
          position: 'absolute',
          right: 22,
          bottom: 22,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(37, 99, 235, 0.65)',
          borderRadius: 999,
          color: '#2563eb',
          fontSize: 25,
          fontWeight: 700,
        }}
      >
        →
      </div>
    </div>
  );
}

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: 1200,
          height: 630,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
          background:
            'linear-gradient(145deg, #ffffff 0%, #f8fbff 46%, #eef6ff 100%)',
          color: '#111111',
          fontFamily:
            '"Noto Sans JP", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          <div
            style={{
              position: 'absolute',
              right: -175,
              top: -52,
              width: 290,
              height: 230,
              display: 'flex',
              opacity: 0.35,
            }}
          >
            <svg width="290" height="230" viewBox="0 0 330 250">
              <path
                d="M40 50L128 105L196 38L286 118L226 214L128 105"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.2"
              />
              <path
                d="M196 38L226 214L306 42"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.2"
                opacity="0.45"
              />
              <circle cx="40" cy="50" r="5" fill="#2563eb" />
              <circle cx="128" cy="105" r="5" fill="#2563eb" />
              <circle cx="196" cy="38" r="5" fill="#2563eb" />
              <circle cx="286" cy="118" r="5" fill="#2563eb" />
              <circle cx="226" cy="214" r="5" fill="#2563eb" />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 240,
              height: 240,
              background: 'rgba(37, 99, 235, 0.28)',
              clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
            }}
          />
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '58px 72px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 62,
              fontWeight: 900,
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}
          >
            SPO JAPAN GUILD
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              fontSize: 54,
              fontWeight: 900,
              color: '#2563eb',
              lineHeight: 1,
            }}
          >
            ドキュメント
          </div>

          <div
            style={{
              marginTop: 13,
              width: 58,
              height: 5,
              borderRadius: 999,
              background: '#2563eb',
            }}
          />

          <div
            style={{
              marginTop: 22,
              display: 'flex',
              fontSize: 21,
              fontWeight: 800,
              color: '#111111',
            }}
          >
            SPO JAPAN GUILD監修 / Cardano / Midnight インフラ構築・運用ガイド
          </div>

          <div
            style={{
              marginTop: 13,
              display: 'flex',
              fontSize: 17,
              fontWeight: 700,
              color: '#333333',
            }}
          >
            ノード構築から日々の運用、監視、更新対応まで、実践に基づく情報をまとめています。
          </div>

          <div
            style={{
              marginTop: 32,
              display: 'flex',
              gap: 20,
            }}
          >
            <Card
              accent="#2563eb"
              description={'Cardanoノード、SPO運用、\nMithril、監視、更新対応を\n実務ベースでまとめています。'}
              logo="cardano"
              title="SPO運用の実践ガイド"
            />
            <Card
              accent="#6366f1"
              description={'Midnight検証環境、Validator運用、\nセットアップ手順で得た知見を\n整理しています。'}
              logo="midnight"
              title="検証環境の知見を順次整理"
            />
            <Card
              accent="#2563eb"
              description={'SPOミーティングで共有している\n運用基礎やトラブルシューティング\n教材を公開しています。'}
              logo="sjg"
              title="運用基礎・学習教材"
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}

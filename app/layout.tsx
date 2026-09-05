import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'GenCompass — клинический скрининг',
  description:
    'Оценка клинических признаков, объяснение результата и направление к генетику. Прототип Lumen Genomics с демонстрационным скорингом.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

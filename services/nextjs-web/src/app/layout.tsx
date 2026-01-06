export const metadata = {
  title: 'Next.js Web Service',
  description: 'Next.js application running in Docker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


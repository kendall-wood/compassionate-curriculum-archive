import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Compassionate Curriculum Archive",
  description:
    "An interactive, accessible archive of the Compassionate Curriculum — a participatory framework for learning, reflection, and collective growth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cc-theme');if(t==='dark'){document.documentElement.classList.add('dark');}var z=localStorage.getItem('cc-zoom');if(z){document.documentElement.style.setProperty('--zoom',z);}var a=localStorage.getItem('cc-accent');if(a){document.documentElement.style.setProperty('--color-accent',a);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

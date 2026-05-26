import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="snaptrack-theme">
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Hello, Vite + React!</h1>
      </div>
    </ThemeProvider>
  );
}

export default App;

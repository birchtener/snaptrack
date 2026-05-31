import PixelBlast from "@/components/background/PixelBlast";
import { Outlet, Link } from "react-router-dom";
import Logo from "@/assets/Logo";

export default function AuthPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="flex items-center justify-center">
              <Logo className="size-6 text-primary" />
            </div>
            SnapTrack
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#1447e6"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export const Logo = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    setAnimate(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`transition-all duration-500 ${
              animate ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <img
              src="/assets/images/temp-mail-icon-removebg.png"
              alt="Temp-Mail.lol Logo"
              className={`h-10 w-10 transition-transform duration-500 ${
                animate ? "animate-[bounce_1s_ease-in-out]" : ""
              }`}
            />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span 
            className={`font-bold text-3xl tracking-tight transition-all duration-500 text-primary ${
              animate ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            }`}
          >
            temp-mail
          </span>
          <span 
            className={`font-medium text-2xl tracking-tight transition-all duration-500 text-muted-foreground ${
              animate ? "translate-x-0 opacity-100 delay-100" : "translate-x-4 opacity-0"
            }`}
          >
            .lol
          </span>
        </div>
      </div>
      <p 
        className={`text-sm text-muted-foreground mt-1 transition-all duration-500 ${
          animate ? "translate-y-0 opacity-100 delay-200" : "translate-y-2 opacity-0"
        }`}
      >
        Instant Disposable Email Service
      </p>
    </div>
  );
};

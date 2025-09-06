import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Simple", "Secure", "Reliable", "Smarter", "Faster"],
    []
  );
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            {/* Website Name */}
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-center">
              Monitr
            </h1>

            {/* Animated Tagline */}
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">AI Monitoring Made</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Home security shouldn’t be complicated. Instead of relying on
              outdated systems or constant manual checks, our AI-powered
              monitoring gives you peace of mind with protection that’s smarter,
              faster, and more reliable.
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <Button
              size="lg"
              className="gap-4"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Log in <LogIn className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="gap-4"
              onClick={() => navigate("/signup")}
            >
              Get Started <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };

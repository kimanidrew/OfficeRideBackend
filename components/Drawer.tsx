"use client";
import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { getRandomPhoto } from "@/lib/unsplash";
import { IoCloseOutline } from "react-icons/io5";

interface DrawerContextType {
  openDrawer: (
    side: "left" | "right",
    content: React.ReactNode,
    heading?: string
  ) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within DrawerProvider");
  return ctx;
};

export const DrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const [content, setContent] = useState<React.ReactNode>(null);
  const [heading, setHeading] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPhoto() {
      const url = await getRandomPhoto("commute,car,office,employees");
      setPhotoUrl(url);
    }
    fetchPhoto();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setIsScrolled(el.scrollTop > 0);
    };

    // initialize state in case content is already scrolled
    handleScroll();

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  const openDrawer = (s: "left" | "right", c: React.ReactNode, h?: string) => {
    setSide(s);
    setContent(c);
    setHeading(h || "");
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContent(null);
      setHeading("");
    }, 300);
  };

  const borderRadiusClass =
    side === "right" ? "rounded-tl-4xl" : "rounded-tr-4xl";

  const positionClass =
    side === "right"
      ? isOpen
        ? "right-0 translate-x-0"
        : "right-0 translate-x-full"
      : isOpen
      ? "left-0 translate-x-0"
      : "left-0 -translate-x-full";

  // ✅ FIX: Avoid TypeScript error by loosening type or wrapping
  let contentWithIsScrolled: React.ReactNode = content;
  if (React.isValidElement(content)) {
    contentWithIsScrolled = React.cloneElement(
      content as React.ReactElement<any>, // allow extra props
      { isScrolled }
    );
  }

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeDrawer} />
      )}

      <div
        className={`shadow-lg fixed top-0 h-full w-1/2 z-50 transform transition-transform duration-300 ${positionClass} ${borderRadiusClass}`}
        style={{
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className={`relative h-full w-full backdrop-blur-xl pr-2 text-black ${borderRadiusClass} flex flex-col`}
        >
          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pl-5 pr-2 pt-15 pb-5 custom-scrollbar relative z-10"
          >
            {/* Header row */}
            <div
              className={`fixed top-0 left-0 z-20 px-10 w-full flex flex-col flex-shrink-0 py-2 ${borderRadiusClass} transition-colors duration-300 ${
                isScrolled ? "bg-black" : "bg-transparent"
              }`}
            >
              <div className="flex items-center justify-between pb-3">
                {side === "right" ? (
                  <>
                    <button
                      onClick={closeDrawer}
                      className="cursor-pointer text-gray-300 hover:text-white mt-2"
                    >
                      <IoCloseOutline size={40} />
                    </button>
                    <p className="text-4xl font-[700] text-white">
                      {heading}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-[700] text-white">
                      {heading}
                    </p>
                    <button
                      onClick={closeDrawer}
                      className="cursor-pointer text-gray-300 hover:text-white mt-2"
                    >
                      <IoCloseOutline size={40} />
                    </button>
                  </>
                )}
              </div>
              <div className="w-[80px] h-[4px] rounded-full bg-white absolute bottom-3 right-10"></div>
            </div>

            {/* Render content with injected isScrolled prop when possible */}
            <div className="relative z-0">{contentWithIsScrolled}</div>
          </div>
        </div>
      </div>
    </DrawerContext.Provider>
  );
};

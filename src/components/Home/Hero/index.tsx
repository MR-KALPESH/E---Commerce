import { getHeroSliders } from "@/get-api-data/hero";
import HeroCarousel from "./HeroCarousel";

const Hero = async () => {
  const sliders = await getHeroSliders();

  return (
    <section className="overflow-hidden pb-12 pt-40 bg-[#F7F7F7]">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        {/* Main Slider takes full 100% width */}
        <div className="w-full">
          <div className="relative overflow-hidden bg-white border z-1 border-gray-2 rounded-2xl">
            <HeroCarousel sliders={sliders} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import Image from "next/image";
import Link from "next/link";
import LargePromoBanner from "./LargePromoBanner";
import SmallPromoBanner from "./SmallPromoBanner";



const PromoBanner = () => {
  return (
    <section className="py-20 overflow-hidden">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        <LargePromoBanner
          imageUrl="/images/products/product-1-bg-1.png"
          subtitle="Summer Hydration Glow"
          title="UP TO 35% OFF ALL SERUMS"
          description="Formulated with organic aloe vera and pure hyaluronic acid, this lightweight hydrating serum absorbs quickly to revitalize dehydrated skin cells."
          link="hydrating-hyaluronic-acid-serum"
          buttonText="Purchase Now"
        />
        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          <SmallPromoBanner
            imageUrl="/images/products/product-2-bg-1.png"
            subtitle="Steam-Distilled Hydration"
            title="Organic Rosewater Toner"
            discount="Natural Glow for Skin & Hair"
            link="/products/organic-rosewater-facial-toner"
            buttonText="Grab the deal"
          />

          <SmallPromoBanner
            imageUrl="/images/products/product-4-bg-1.png"
            subtitle="Velvety Matte Finish"
            title="Matte Liquid Lipstick"
            description="Classic Red shade enriched with vitamin E for comfortable, long-lasting velvety wear."
            link="/products/matte-liquid-lipstick-classic-red"
            buttonText="Grab the deal"
          />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";
import { IHeroSlider } from "@/types/hero";

const HeroCarousal = ({ sliders }: { sliders: any }) => {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {sliders?.map((slider: IHeroSlider, key: number) => (
        <SwiperSlide key={key}>
          <div className="flex flex-col-reverse items-center pt-6 sm:pt-0 sm:flex-row justify-between w-full px-6 sm:px-16 lg:px-24">
            <div className="max-w-[450px] py-10 sm:py-15 lg:py-24 pl-4">
              <div className="flex items-center gap-4 mb-5">
                <span className="block font-semibold text-heading-3 sm:text-[58px] text-blue">
                  {slider?.discountRate}%
                </span>
                <span className="block text-sm uppercase text-dark sm:text-xl sm:leading-6">
                  Sale
                  <br />
                  Off
                </span>
              </div>

              <h1 className="mb-3 text-xl font-semibold text-dark sm:text-3xl">
                <Link href={`/products/${slider?.product?.slug}`}>
                  {slider?.product?.title}
                </Link>
              </h1>

              <p className="text-base text-meta-3">
                {slider?.product?.shortDescription?.slice(0, 100)}
              </p>

              <Link
                href={`/products/${slider?.product?.slug}`}
                className="inline-flex py-3 mt-10 font-medium text-white duration-200 ease-out rounded-lg text-custom-sm bg-dark px-9 hover:bg-darkLight"
              >
                Shop Now
              </Link>
            </div>

            <div className="shrink-0 p-4 sm:p-8">
              <Image
                src={slider?.sliderImage ? slider?.sliderImage! : "/no image"}
                alt={slider?.sliderName || "skincare-product"}
                width={360}
                height={400}
                loading="eager"
                className="object-contain"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;

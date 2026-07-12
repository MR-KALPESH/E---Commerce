"use client";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { EyeIcon } from "@/assets/icons";
import { useCart } from "@/hooks/useCart";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import { Product } from "@/types/product";
import { calculateDiscountPercentage } from "@/utils/calculateDiscountPercentage";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import CheckoutBtn from "../Shop/CheckoutBtn";
import WishlistButton from "../Wishlist/AddWishlistButton";
import Tooltip from "./Tooltip";

type Props = {
  bgClr?: string;
  item: Product;
};
// add updated the type here
const ProductItem = ({ item, bgClr = "[#F6F7FB]" }: Props) => {
  const defaultVariant = item?.productVariants.find(
    (variant) => variant.isDefault
  );
  const { openModal } = useModalContext();
  // const [product, setProduct] = useState({});
  const dispatch = useDispatch<AppDispatch>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { addItem, cartDetails } = useCart();

  const pathUrl = usePathname();

  const isAlradyAdded = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id === item.id
  );

  const cartItem = {
    id: item.id,
    name: item.title,
    price: item.discountedPrice ? item.discountedPrice : item.price,
    currency: "usd",
    image: defaultVariant?.image ? defaultVariant.image : "",
    slug: item?.slug,
    availableQuantity: item.quantity,
    color: defaultVariant?.color ? defaultVariant.color : "",
    size: defaultVariant?.size ? defaultVariant.size : "",
  };

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    const serializableItem = {
      ...item,
      updatedAt:
        item.updatedAt instanceof Date
          ? item.updatedAt.toISOString()
          : item.updatedAt, // ✅ Convert Date to ISO string
    };
    dispatch(updateQuickView(serializableItem));
  };

  // add to cart
  const handleAddToCart = (item: Product) => {
    if (item.quantity > 0) {
      // @ts-ignore
      addItem(cartItem);
      toast.success("Product added to cart!");
    } else {
      toast.error("This product is out of stock!");
    }
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        id: item.id,
        title: item.title,
        slug: item.slug,
        image: defaultVariant?.image ? defaultVariant.image : "",
        price: item.discountedPrice ? item.discountedPrice : item.price,
        quantity: item.quantity,
        color: defaultVariant?.color ? defaultVariant.color : "",
      })
    );
  };

  return (
    <div className="group">
      <div
        className={`relative overflow-hidden border border-gray-3 flex items-center justify-center rounded-xl bg-white h-[270px] w-full mb-4`}
      >
        <Link
          href={`/products/${item?.slug}`}
          className="relative w-full h-full block"
        >
          {(defaultVariant?.image || item.productVariants?.[0]?.image) ? (
            <Image
              src={defaultVariant?.image || item.productVariants[0]?.image}
              alt={item.title || "product-image"}
              fill
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 270px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-2 text-dark-4 text-xs">
              No Image
            </div>
          )}
        </Link>
        <div className="absolute top-2 right-2">
          {item.quantity < 1 ? (
            <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              Out of Stock
            </span>
          ) : item?.discountedPrice && item?.discountedPrice > 0 ? (
            <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-blue">
              {calculateDiscountPercentage(item.discountedPrice, item.price)}%
              OFF
            </span>
          ) : null}
        </div>

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <Tooltip content="Quick View" placement="top">
            <button
              className="border border-gray-3 h-[38px] w-[38px] rounded-lg flex items-center justify-center text-dark bg-white hover:text-blue"
              onClick={() => {
                openModal();
                handleQuickViewUpdate();
              }}
            >
              <EyeIcon />
            </button>
          </Tooltip>

          {isMounted && isAlradyAdded ? (
            <CheckoutBtn />
          ) : (
            <button
              onClick={() => handleAddToCart(item)}
              disabled={item.quantity < 1}
              className="inline-flex px-5 py-2 font-medium h-[38px] text-white duration-200 ease-out rounded-lg text-custom-sm bg-blue hover:bg-blue-dark"
            >
              {item.quantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          )}
          {/* wishlist button */}
          <WishlistButton
            item={item}
            handleItemToWishList={handleItemToWishList}
          />
        </div>
      </div>

      <h3 className="font-semibold text-dark ease-out text-base duration-200 hover:text-blue mb-1.5 line-clamp-1">
        <Link
          href={`/products/${item?.slug}`}
        >
          {" "}
          {item.title}{" "}
        </Link>
      </h3>

      <span className="flex items-center gap-2 text-base font-medium">
        {item.discountedPrice && (
          <span className="line-through text-dark-4">
            {formatPrice(item.price)}
          </span>
        )}
        <span className="text-dark">
          {formatPrice(item.discountedPrice || item.price)}
        </span>
      </span>
    </div>
  );
};

export default ProductItem;

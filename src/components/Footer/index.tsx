import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/assets/icons/social";
import Link from "next/link";
import AccountLinks from "./AccountLinks";
import FooterBottom from "./FooterBottom";
import { AppStoreIcon, GooglePlayIcon } from "./icons";
import QuickLinks from "./QuickLinks";

const Footer = () => {
  return (
    <footer className="overflow-hidden border-t border-gray-3 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        {/* <!-- footer menu start --> */}
        <div className="flex flex-wrap xl:flex-nowrap gap-8 xl:justify-between pt-10 xl:pt-14 pb-8">
          <div className="max-w-[290px] w-full">
            <h2 className="mb-4.5 text-base font-semibold text-dark">
              Help & Support
            </h2>

            <ul className="flex flex-col gap-2.5 text-xs text-dark-3">
              <li className="flex gap-3 text-custom-sm">
                <span className="shrink-0">
                  <MapIcon className="fill-blue" width={18} height={18} />
                </span>
                685 Market Street, Las Vegas, NV 89101, US
              </li>

              <li>
                <Link
                  href="tel:+099 532-786-9843"
                  className="flex items-center gap-3 text-custom-sm hover:text-blue transition-colors"
                >
                  <CallIcon className="fill-blue" width={18} height={18} />
                  (+099) 532-786-9843
                </Link>
              </li>

              <li>
                <Link
                  href="mailto:support@cozycommerce.com"
                  className="flex items-center gap-3 text-custom-sm hover:text-blue transition-colors"
                >
                  <EmailIcon className="fill-blue" width={18} height={18} />
                  support@cozycommerce.com
                </Link>
              </li>
            </ul>

            {/* <!-- Social Links start --> */}
            <div className="flex items-center gap-3.5 mt-5">
              <Link
                href="#"
                className="flex duration-200 ease-out hover:text-blue"
              >
                <span className="sr-only">Facebook link</span>
                <FacebookIcon />
              </Link>

              <Link
                href="#"
                className="flex duration-200 ease-out hover:text-blue"
              >
                <span className="sr-only">Twitter link</span>
                <TwitterIcon />
              </Link>

              <Link
                href="#"
                className="flex duration-200 ease-out hover:text-blue"
              >
                <span className="sr-only">Instagram link</span>
                <InstagramIcon />
              </Link>

              <Link
                href="#"
                aria-label="Linkedin Social Link"
                className="flex duration-200 ease-out hover:text-blue"
              >
                <span className="sr-only">LinkedIn link</span>
                <LinkedInIcon />
              </Link>
            </div>
            {/* <!-- Social Links end --> */}
          </div>

          <AccountLinks />

          <QuickLinks />

          <div className="w-full sm:w-auto xl:max-w-[280px] min-w-[240px]">
            <h2 className="mb-4.5 text-base font-semibold text-dark">
              Our Location
            </h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3222.3837943516597!2d-115.14364132349798!3d36.133202972447954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c8c41db1b6a7ad%3A0xe9f70691515bc407!2sMarket%20St%2C%20Las%20Vegas%2C%20NV!5e0!3m2!1sen!2sus!4v1719811559812!5m2!1sen!2sus"
              width="100%"
              height="120"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="border border-gray-3 shadow-sm"
            />
          </div>
        </div>
        {/* <!-- footer menu end --> */}
      </div>

      <FooterBottom />
    </footer>
  );
};

export default Footer;

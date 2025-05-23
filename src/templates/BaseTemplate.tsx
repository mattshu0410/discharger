'use client';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1">{props.children}</main>
      <footer className="border-t border-gray-300 py-8 text-center text-sm ">
        {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. `}
        {/*
           * PLEASE READ THIS SECTION
           * I'm an indie maker with limited resources and funds, I'll really appreciate if you could have a link to my website.
           * The link doesn't need to appear on every pages, one link on one page is enough.
           * For example, in the `About` page. Thank you for your support, it'll mean a lot to me.
           */}
      </footer>
    </div>
  );
};

'use client';
import { Sidebar } from '@/components/Sidebar';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="w-full px-1 text-gray-700 antialiased">
      <div className="flex flex-row">
        <div>
          <Sidebar />
        </div>
        <div>
          <main>{props.children}</main>
        </div>
      </div>
      <footer className="border-t border-gray-300 py-8 text-center text-sm">
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

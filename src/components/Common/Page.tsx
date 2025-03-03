import { RefObject } from "react";

import { cn } from "@/lib/utils";

import PageTitle, { PageTitleProps } from "@/components/Common/PageTitle";

interface PageProps extends PageTitleProps {
  children: React.ReactNode | React.ReactNode[];
  options?: React.ReactNode | React.ReactNode[];
  changePageMetadata?: boolean;
  className?: string;
  ref?: RefObject<HTMLDivElement>;
  /**
   * If true, the sidebar will be collapsed when mounted, and restored to original state when unmounted.
   * @default false
   **/
  collapseSidebar?: boolean;
  hideTitleOnPage?: boolean;
}

export default function Page(props: PageProps) {
  // const sidebar = useContext(SidebarShrinkContext);

  // useEffect(() => {
  //   if (!props.collapseSidebar) return;

  //   sidebar.setShrinked(true);
  //   return () => {
  //     sidebar.setShrinked(sidebar.shrinked);
  //   };
  // }, [props.collapseSidebar]);

  return (
    <div className={cn("md:px-6 py-0 grid", props.className)} ref={props.ref}>
      <div className="flex flex-col justify-between gap-2 px-3 md:flex-row md:items-center md:gap-6 md:px-0">
        <PageTitle
          changePageMetadata={props.changePageMetadata}
          title={props.title}
          componentRight={props.componentRight}
          focusOnLoad={props.focusOnLoad}
          isInsidePage={true}
          hideTitleOnPage={props.hideTitleOnPage}
        />
        {props.options}
      </div>
      {props.children}
    </div>
  );
}

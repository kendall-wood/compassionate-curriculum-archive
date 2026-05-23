import Link from "next/link";

export default function NotFound() {
  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[32px] pr-[32px] pt-[27px] pb-[80px]">
      <div className="flex flex-col gap-[36px] w-full">
        <h1 className="text-[72px] leading-[1.05] tracking-[-2.16px] text-fg font-normal">
          Page not found
        </h1>
        <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg max-w-[1264px]">
          The page you are looking for could not be located.
        </p>
        <Link
          href="/"
          className="inline-flex w-fit items-center justify-center px-[10px] py-[6px] border border-fg text-fg bg-bg text-[20px] tracking-[-0.4px] leading-none hover:bg-accent hover:text-black"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
